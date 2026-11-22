/**
 * foundry:ensure-project
 *
 * There is no official Backstage action for Microsoft Foundry. The Azure scaffolder
 * module publishes repositories to Azure DevOps; it does not create AI projects.
 *
 * So the platform team writes one. It is small, it fails closed, and it is the only place
 * in the whole flow that talks to the Foundry control plane.
 *
 * Design decisions worth defending in a review:
 *  - Idempotent. Re-running the template must not create a second project.
 *  - Fails closed. If the project cannot be ensured, the repository is not created: a
 *    repository without a project is a repo whose infra/ cannot deploy.
 *  - Never returns a key. The generated pipeline uses federated OIDC; the action only
 *    returns the endpoint and the deployment name.
 *  - Token limits are not set here. They belong to the gateway policy, which is code in
 *    platform/policies/. Setting a quota in two places is how you get two answers.
 */

import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { DefaultAzureCredential } from '@azure/identity';

type EnsureProjectInput = {
  project: string;
  owner: string;
  deployment: string;
  tpm: number;
};

const ARM = 'https://management.azure.com';
const API_VERSION = '2025-04-01-preview';

export const createFoundryProjectAction = () =>
  createTemplateAction<EnsureProjectInput>({
    id: 'foundry:ensure-project',
    description: 'Creates a Foundry project inside the platform resource, idempotently',
    schema: {
      input: {
        type: 'object',
        required: ['project', 'owner', 'deployment', 'tpm'],
        properties: {
          project: { type: 'string' },
          owner: { type: 'string' },
          deployment: { type: 'string' },
          tpm: { type: 'number' },
        },
      },
      output: {
        type: 'object',
        properties: {
          endpoint: { type: 'string' },
          deployment: { type: 'string' },
        },
      },
    },
    async handler(ctx) {
      const subscription = process.env.AZURE_SUBSCRIPTION_ID;
      const resourceGroup = process.env.FOUNDRY_RESOURCE_GROUP;
      const account = process.env.FOUNDRY_ACCOUNT_NAME;

      if (!subscription || !resourceGroup || !account) {
        // Fail closed, and say which variable is missing. A scaffolder step that
        // silently continues produces a repository nobody can deploy.
        throw new Error(
          'Foundry action is not configured: AZURE_SUBSCRIPTION_ID, FOUNDRY_RESOURCE_GROUP ' +
            'and FOUNDRY_ACCOUNT_NAME are required.',
        );
      }

      const credential = new DefaultAzureCredential();
      const token = await credential.getToken(`${ARM}/.default`);
      if (!token) throw new Error('Could not acquire an Azure token for the Foundry action');

      const headers = {
        Authorization: `Bearer ${token.token}`,
        'Content-Type': 'application/json',
      };

      const base =
        `${ARM}/subscriptions/${subscription}/resourceGroups/${resourceGroup}` +
        `/providers/Microsoft.CognitiveServices/accounts/${account}`;

      const projectUrl = `${base}/projects/${ctx.input.project}?api-version=${API_VERSION}`;

      ctx.logger.info(`Ensuring project ${ctx.input.project} in ${account}`);
      const existing = await fetch(projectUrl, { headers, method: 'GET' });

      if (existing.status === 404) {
        const created = await fetch(projectUrl, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            properties: {
              displayName: ctx.input.project,
              description: `Owned by ${ctx.input.owner}`,
            },
          }),
        });
        if (!created.ok) {
          throw new Error(`Foundry project creation failed: ${created.status} ${await created.text()}`);
        }
      } else if (!existing.ok) {
        throw new Error(`Foundry project lookup failed: ${existing.status} ${await existing.text()}`);
      }

      // Deployment existence is checked, not created: deployments are a platform
      // decision with a cost attached, and the template only picks from the catalog.
      const deploymentUrl = `${base}/deployments/${ctx.input.deployment}?api-version=${API_VERSION}`;
      const deployment = await fetch(deploymentUrl, { headers, method: 'GET' });
      if (!deployment.ok) {
        throw new Error(
          `Deployment ${ctx.input.deployment} does not exist in ${account}. ` +
            'Ask the platform team to add it to the catalog before using it in a template.',
        );
      }

      ctx.output('endpoint', `https://${account}.services.ai.azure.com`);
      ctx.output('deployment', ctx.input.deployment);
      ctx.logger.info(`Project ready. Quota is enforced by the gateway, not here (tpm=${ctx.input.tpm}).`);
    },
  });
