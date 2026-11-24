/**
 * apim:ensure-subscription
 *
 * Gives the new team a place in the AI gateway: one API Management subscription,
 * scoped to the model API. The gateway policy counts tokens per subscription
 * (counter-key = context.Subscription.Id), so this subscription IS the team's
 * counter, and its name is what appears in the attribution header and the cost report.
 *
 * Same rules as foundry:ensure-project:
 *  - Idempotent. Re-running the template must not create a second subscription.
 *  - Fails closed. No subscription, no repository: a team without a counter is a team
 *    that spends without attribution.
 *  - Never returns a key. The team reads its key from the platform's vault; the action
 *    returns only the subscription name.
 *
 * Not applied anywhere in this repository (no Azure subscription). It is the shape of the
 * step, written against the ARM API, and it has not been run against a real gateway.
 *
 * The per-team tokens-per-minute is not set here: it lives in the policy
 * (platform/policies/llm-token-limit.xml). Overriding it per team is the next step.
 */

import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { DefaultAzureCredential } from '@azure/identity';

type EnsureSubscriptionInput = {
  project: string;
  owner: string;
};

const ARM = 'https://management.azure.com';
const API_VERSION = '2022-08-01';

export const createApimSubscriptionAction = () =>
  createTemplateAction<EnsureSubscriptionInput>({
    id: 'apim:ensure-subscription',
    description: 'Creates the team subscription in the AI gateway, idempotently',
    schema: {
      input: {
        type: 'object',
        required: ['project', 'owner'],
        properties: {
          project: { type: 'string' },
          owner: { type: 'string' },
        },
      },
      output: {
        type: 'object',
        properties: {
          subscription: { type: 'string' },
        },
      },
    },
    async handler(ctx) {
      const subscription = process.env.AZURE_SUBSCRIPTION_ID;
      const resourceGroup = process.env.APIM_RESOURCE_GROUP;
      const service = process.env.APIM_SERVICE_NAME;
      const api = process.env.APIM_MODEL_API_ID;

      if (!subscription || !resourceGroup || !service || !api) {
        throw new Error(
          'Gateway action is not configured: AZURE_SUBSCRIPTION_ID, APIM_RESOURCE_GROUP, ' +
            'APIM_SERVICE_NAME and APIM_MODEL_API_ID are required.',
        );
      }

      const credential = new DefaultAzureCredential();
      const token = await credential.getToken(`${ARM}/.default`);
      if (!token) throw new Error('Could not acquire an Azure token for the gateway action');

      const headers = {
        Authorization: `Bearer ${token.token}`,
        'Content-Type': 'application/json',
      };

      const base =
        `${ARM}/subscriptions/${subscription}/resourceGroups/${resourceGroup}` +
        `/providers/Microsoft.ApiManagement/service/${service}`;
      const url = `${base}/subscriptions/${ctx.input.project}?api-version=${API_VERSION}`;

      ctx.logger.info(`Ensuring gateway subscription ${ctx.input.project} in ${service}`);
      const existing = await fetch(url, { headers, method: 'GET' });

      if (existing.status === 404) {
        const created = await fetch(url, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            properties: {
              displayName: ctx.input.project,
              scope: `${base}/apis/${api}`,
              state: 'active',
            },
          }),
        });
        if (!created.ok) {
          throw new Error(`Gateway subscription creation failed: ${created.status} ${await created.text()}`);
        }
      } else if (!existing.ok) {
        throw new Error(`Gateway subscription lookup failed: ${existing.status} ${await existing.text()}`);
      }

      ctx.output('subscription', ctx.input.project);
      ctx.logger.info(`Subscription ready for ${ctx.input.owner}. Tokens are counted per subscription.`);
    },
  });
