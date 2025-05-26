---
draft: false
title: Deploying PostgreSQL Database on Azure Using Terraform with Key Vault Integration
date: 2024-03-10T20:41:28+00:00
author: William
category:
  - Tech
tags:
  - Automation
  - Infrastructure
cover:
  image: terraform-azure.png
  alt: EpicTerraformArchitecture.png
description: Deploying a PostgreSQL database on Azure? Use Terraform to automate the setup in a private VNet, including infrastructure like resource groups, virtual networks, and key vaults for storing credentials. The guide walks through creating subnets, DNS zones, and deploying the database securely, without relying on the Azure GUI. The final setup links the database to your application, with credentials managed via the key vault. Check out the full project details and code on GitHub to streamline your deployment process.
---
So you want to deploy a PostgreSQL database in a private vnet and link it to your custom application in Azure. You have developed this awesome app thrown it into a container image and now you need to build the infrastructure to host your beautiful code. You could click around the disgusting Azure GUI like a pleb or you can be cool and deploy your infrastructure using code. With Terraform being your poison of choice to achieve this don’t worry, you have come to the right place.

To kick ourselves off let’s set up our Terraform backend. Sadly for this step, we do need to set it up manually. Go to Azure and create a **resource group**, **storage account**, and **storage container** in that storage account. Then put those details into our Backup.tf file in your project.

```hcl
# Backend.tf
terraform {
  backend "azurerm" {
    resource_group_name  = "tf-state-rg"
    storage_account_name = "tfstate"
    container_name       = "tfstate"
    key                  = "coolapp.terraform.tfstate"
  }
}
```

Now everything we do to our environment will be saved to a remote state file. Now let’s start building that infrastructure! Starting with that **Resource Group** and **Virtual Network** that we will be deploying all our infrastructure into. We also add our subscription as data elements. I would also like to add that I’m assuming you will be adding the **var** elements to your [variables.tf](https://developer.hashicorp.com/terraform/language/values/variables) file.

```hcl
# Main.tf
data "azurerm_client_config" "current" {}

data "azurerm_subscription" "current" {}

# Create a resource group
resource "azurerm_resource_group" "rg" {
  name     = lower("${var.rg_name}-${var.environment}")
  location = var.rg_location

  tags = {
    environment = var.environment
  }
}

# Create Virtual Network
resource "azurerm_virtual_network" "vnet" {
  name                = lower("${var.vnet_name}-${var.environment}")
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  address_space       = var.vnet_address_space

  tags = {
    environment = var.environment
  }

  depends_on = [
    azurerm_resource_group.rg
  ]
}
```

To prepare for the database I want to deploy a **key vault** to keep my secrets safe and secure. This step is optional as you can always deploy the database without storing the admin credentials in a vault but I want to do it this way. To achieve this we must deploy a dedicated **<span class="notion-enable-hover" data-token-index="1">subnet</span>** and **<span class="notion-enable-hover" data-token-index="5">vault</span>**. Let’s start with the **subnet**.

```hcl
# Vault.tf
# Vault Subnet
resource "azurerm_subnet" "vault_subnet" {
  name                                          = var.vault_subnet_name
  resource_group_name                           = azurerm_virtual_network.vnet.resource_group_name
  virtual_network_name                          = azurerm_virtual_network.vnet.name
  address_prefixes                              = var.vault_subnet_address_prefixes
  private_endpoint_network_policies_enabled     = false
  private_link_service_network_policies_enabled = false
  service_endpoints                             = ["Microsoft.KeyVault"]
}

# Vault DNS zone
resource "azurerm_private_dns_zone" "vault_dns_zone" {
  name                = "cool-app-privatelink.vaultcore.azure.net"
  resource_group_name = azurerm_virtual_network.vnet.resource_group_name

  depends_on = [
    azurerm_virtual_network.vnet
  ]
}

# Private virtual network link to vnet
resource "azurerm_private_dns_zone_virtual_network_link" "vault_dns_zone_vnet_link" {
  name                  = "privatelink_to_${azurerm_virtual_network.vnet.name}"
  resource_group_name   = azurerm_virtual_network.vnet.resource_group_name
  virtual_network_id    = azurerm_virtual_network.vnet.id
  private_dns_zone_name = azurerm_private_dns_zone.vault_dns_zone.name

  lifecycle {
    ignore_changes = [
      tags
    ]
  }
  depends_on = [
    azurerm_resource_group.rg,
    azurerm_virtual_network.vnet,
    azurerm_private_dns_zone.vault_dns_zone
  ]
}

```

Now that we have our subnet let’s deploy our **vault** into said subnet.

```hcl
# Vault.tf
# Randomize part of name
resource "random_string" "prefix" {
  length           = 4
  special          = true
  override_special = "abcdefghijklmnopqrstuvwxyz"
}

# Key Vault
resource "azurerm_key_vault" "key_vault" {
  name                = "${var.key_vault_name}-${var.environment}-${random_string.prefix.result}"
  resource_group_name = azurerm_virtual_network.vnet.resource_group_name
  location            = azurerm_virtual_network.vnet.location
  tenant_id           = data.azurerm_subscription.current.tenant_id
  sku_name            = var.key_vault_sku

  soft_delete_retention_days    = 7
  purge_protection_enabled      = false
  enabled_for_disk_encryption   = true
  public_network_access_enabled = true


  network_acls {
    default_action = "Allow"
    bypass = "AzureServices"
  }

  access_policy {
    tenant_id = data.azurerm_subscription.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    key_permissions         = var.kv_key_permissions
    secret_permissions      = var.kv_secret_permissions
    certificate_permissions = var.kv_certificate_permissions
    storage_permissions     = var.kv_storage_permissions
  }
  depends_on = [
    random_string.prefix,
    azurerm_subnet.vault_subnet,
  ]
}

# Create private endpoint for key vault
resource "azurerm_private_endpoint" "vault_private_endpoint" {
  name                = lower("PrivateEndpoint-${azurerm_key_vault.key_vault.name}")
  location            = azurerm_virtual_network.vnet.location
  resource_group_name = azurerm_virtual_network.vnet.resource_group_name
  subnet_id           = azurerm_subnet.psql_config_subnet.id

  private_service_connection {
    name                           = "pe-${azurerm_key_vault.key_vault.name}"
    private_connection_resource_id = azurerm_key_vault.key_vault.id
    is_manual_connection           = false
    subresource_names              = ["vault"]
  }

  private_dns_zone_group {
    name                 = "default" 
    private_dns_zone_ids = [azurerm_private_dns_zone.vault_dns_zone.id]
  }

  lifecycle {
    ignore_changes = [
      tags
    ]
  }
  depends_on = [
    azurerm_key_vault.key_vault,
    azurerm_private_dns_zone.vault_dns_zone
  ]
}

```

You will notice a couple of issues with the above configuration.   
1\) We are using access policies instead of RBAC. You can set up RBAC if you want with the vault, which is in line with best practice, but to keep this post relatively simple I’m going to use access policies and link my Azure user account to be the only user that can access this vault. A quick Google search will get you where you need to go.  
2\) We have network\_acls set to default allow. This isn’t ideal either as anything can connect to this in theory. This is however locked down by our access policy only allowing me to access this. The reason I did this I wanted to stick to the restriction of not going into the GUI to add secrets or I would have to build in a “jump box” with access to the private subnet to add these secrets… I could do this buuut I don’t want this post to go on forever!

Anyhow fantastic we have set up our **Key Vault** in a **Subnet** with an **endpoint** that we can hit.

Now let’s do what we came here to do, deployment of the **Postgres server**! Firstly Azure requires that the PostgreSQL server is deployed in a dedicated **subnet** with a **private endpoint**. So let us do that!

```hcl
# PostgreSQL.tf
# PostgreSQL Subnet
resource "azurerm_subnet" "psql_subnet" {
  name                                          = var.psql_subnet_name
  resource_group_name                           = azurerm_virtual_network.vnet.resource_group_name
  virtual_network_name                          = azurerm_virtual_network.vnet.name
  address_prefixes                              = var.psql_subnet_address_prefixes
  private_endpoint_network_policies_enabled     = false
  private_link_service_network_policies_enabled = false
  service_endpoints                             = ["Microsoft.Storage", "Microsoft.KeyVault"]

  delegation {
    name = "postgreSQLdelegation"
    service_delegation {
      name = "Microsoft.DBforPostgreSQL/flexibleServers"
      actions = [
        "Microsoft.Network/virtualNetworks/subnets/join/action",
      ]
    }
  }

  depends_on = [
    azurerm_virtual_network.vnet
  ]

}
# PostgreSQL DNS Zone
resource "azurerm_private_dns_zone" "psql_dns_zone" {
  name                = "${var.psql_server_name}-${var.environment}.private.postgres.database.azure.com"
  resource_group_name = azurerm_virtual_network.vnet.resource_group_name
  # Tags

  depends_on = [
    azurerm_virtual_network.vnet
  ]
}
# Link that up
resource "azurerm_private_dns_zone_virtual_network_link" "psql_dns_zone_link" {
  name                  = "link_to_${azurerm_virtual_network.vnet.name}"
  resource_group_name   = azurerm_virtual_network.vnet.resource_group_name
  private_dns_zone_name = azurerm_private_dns_zone.psql_dns_zone.name
  virtual_network_id    = azurerm_virtual_network.vnet.id

  depends_on = [
    azurerm_private_dns_zone.psql_dns_zone,
    azurerm_virtual_network.vnet
  ]
}

```

We will also need to create the credentials required for the PostgreSQL server.

```hcl
# PostgreSQL.tf
# Create admin user password
resource "random_password" "psql_admin_password" {
  length           = 20
  special          = true
  lower            = true
  upper            = true
  override_special = "!#"
}

# Create admin user & password in vault
resource "azurerm_key_vault_secret" "psql_admin_username" {
  name         = "postgres-db-username"
  value        = var.psql_admin_login
  key_vault_id = azurerm_key_vault.key_vault.id
  tags         = {}
  depends_on = [
    azurerm_key_vault.key_vault,
  ]
}

resource "azurerm_key_vault_secret" "psql_admin_password" {
  name         = "postgres-db-password"
  value        = random_password.psql_admin_password.result
  key_vault_id = azurerm_key_vault.key_vault.id
  tags         = {}
  depends_on = [
    azurerm_key_vault.key_vault,
    random_password.psql_admin_password,
  ]
}

```

With our dedicated subnet deployed, key vault deployed, and credentials for the PostgreSQL server-generated and injected into the vault… IT IS TIME TO DEPLOY THE SERVER!!!!!!

```hcl
# PostgreSQL.tf
# PostgreSQL Server
resource "azurerm_postgresql_flexible_server" "psql_server" {
  name                = lower("${var.psql_server_name}-${var.environment}")
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  delegated_subnet_id = azurerm_subnet.psql_subnet.id
  private_dns_zone_id = azurerm_private_dns_zone.psql_dns_zone.id
  zone                = 1

  administrator_login    = azurerm_key_vault_secret.psql_admin_username.value
  administrator_password = azurerm_key_vault_secret.psql_admin_password.value

  version    = var.psql_server_version
  sku_name   = var.psql_server_sku_name
  storage_mb = var.psql_server_storage_mb

  backup_retention_days = 7

  depends_on = [
    azurerm_resource_group.rg,
    azurerm_subnet.psql_subnet,
    azurerm_private_dns_zone.psql_dns_zone,
    azurerm_key_vault_secret.psql_admin_username,
    azurerm_key_vault_secret.psql_admin_password
  ]
}

# PostgreSQL Database
resource "azurerm_postgresql_flexible_server_database" "psql_db" {
  name      = var.psql_database_name
  server_id = azurerm_postgresql_flexible_server.psql_server.id
  charset   = "utf8"
  collation = "en_US.utf8"

lifecycle {
   prevent_destroy = false
}

  depends_on = [
    azurerm_postgresql_flexible_server.psql_server
  ]
}
```

CONGRATULATIONS! You have deployed a PostgreSQL DB with a key vault ready to be used by the awesomely cool app you want to share with the world. We can mount the necessary credentials into the environment variables of the container for our script to use.

There are several other things I could build on. Whether that be the configuration of the database on the private network or the scheduled execution of your apps’ containers. I’ll see if I write up a dedicated blog post for it.

Now if you have read this far I truly thank you from the bottom of my heart…   
NOW GO TOUCH SOME GRASS 😀

![EpicBemo](https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExazd6cWJuZjE1bTdpc2VtdGZlY3V2eWZoeHlkMGd6ejg4MnZrbmpqZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ILjkBExIzBhrFzqDVP/giphy.gif#center)