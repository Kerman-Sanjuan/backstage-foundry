# The governance boundary.
#
# Not applied anywhere in this repository: no subscription, no state. This is the shape of
# the boundary, not a module to run in production.
#
#   resource  -> network, identity, model deployments, quota
#   project   -> the team's workspace, created inside the resource
#   deployment-> which model, how much capacity, where the traces go

terraform {
  required_version = ">= 1.7"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

variable "location" {
  type    = string
  default = "spaincentral"
}

variable "resource_group" {
  type = string
}

variable "account_name" {
  type        = string
  description = "Platform-owned. A team never creates one of these."
}

variable "deployment_name" {
  type        = string
  description = "Deployment name, not model name. This is what the template lists."
  default     = "gpt-4o-mini"
}

variable "model_name" {
  type    = string
  default = "gpt-4o-mini"
}

variable "model_version" {
  type    = string
  default = "2024-07-18"
}

variable "capacity_tpm" {
  type        = number
  description = "Quota of the deployment. Per-caller split lives in the gateway."
  default     = 20000
}

variable "app_insights_id" {
  type        = string
  description = "Traces go here. One workspace for the whole platform, or one per unit."
}

resource "azurerm_cognitive_account" "foundry" {
  name                  = var.account_name
  location              = var.location
  resource_group_name   = var.resource_group
  kind                  = "AIServices"
  sku_name              = "S0"
  custom_subdomain_name = var.account_name

  # The boundary: no public model endpoint, identity only, no local keys.
  public_network_access_enabled    = false
  local_auth_enabled               = false
  outbound_network_access_restricted = true

  identity {
    type = "SystemAssigned"
  }

  tags = {
    owned_by = "platform-team"
  }
}

# A project is a workspace inside the resource. Never a sibling resource: that is how a
# platform team loses control of egress, identity and quota at the same time.
resource "azurerm_cognitive_account_project" "team" {
  for_each = toset(["platform-demo"])

  name                 = each.key
  cognitive_account_id = azurerm_cognitive_account.foundry.id
  location             = var.location

  identity {
    type = "SystemAssigned"
  }
}

# The deployment and its quota. Note what is NOT here: no per-team token limit.
# The deployment quota is a ceiling; the per-caller split is a gateway policy, because
# that is the only component that sees who is calling.
resource "azurerm_cognitive_deployment" "model" {
  name                 = var.deployment_name
  cognitive_account_id = azurerm_cognitive_account.foundry.id

  model {
    format  = "OpenAI"
    name    = var.model_name
    version = var.model_version
  }

  sku {
    name     = "DataZoneStandard"
    capacity = var.capacity_tpm
  }
}

output "endpoint" {
  value = "https://${azurerm_cognitive_account.foundry.custom_subdomain_name}.services.ai.azure.com"
}

output "project_names" {
  value = [for p in azurerm_cognitive_account_project.team : p.name]
}

output "deployment_name" {
  value = azurerm_cognitive_deployment.model.name
}
