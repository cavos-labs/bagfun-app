export const AVNU = [
    {
      "type": "impl",
      "name": "ExchangeLocker",
      "interface_name": "avnu::interfaces::locker::ILocker"
    },
    {
      "type": "interface",
      "name": "avnu::interfaces::locker::ILocker",
      "items": [
        {
          "type": "function",
          "name": "locked",
          "inputs": [
            {
              "name": "id",
              "type": "core::integer::u32"
            },
            {
              "name": "data",
              "type": "core::array::Array::<core::felt252>"
            }
          ],
          "outputs": [
            {
              "type": "core::array::Array::<core::felt252>"
            }
          ],
          "state_mutability": "external"
        }
      ]
    },
    {
      "type": "impl",
      "name": "Exchange",
      "interface_name": "avnu::exchange::IExchange"
    },
    {
      "type": "enum",
      "name": "core::bool",
      "variants": [
        {
          "name": "False",
          "type": "()"
        },
        {
          "name": "True",
          "type": "()"
        }
      ]
    },
    {
      "type": "struct",
      "name": "core::integer::u256",
      "members": [
        {
          "name": "low",
          "type": "core::integer::u128"
        },
        {
          "name": "high",
          "type": "core::integer::u128"
        }
      ]
    },
    {
      "type": "struct",
      "name": "avnu::models::Route",
      "members": [
        {
          "name": "sell_token",
          "type": "core::starknet::contract_address::ContractAddress"
        },
        {
          "name": "buy_token",
          "type": "core::starknet::contract_address::ContractAddress"
        },
        {
          "name": "exchange_address",
          "type": "core::starknet::contract_address::ContractAddress"
        },
        {
          "name": "percent",
          "type": "core::integer::u128"
        },
        {
          "name": "additional_swap_params",
          "type": "core::array::Array::<core::felt252>"
        }
      ]
    },
    {
      "type": "interface",
      "name": "avnu::exchange::IExchange",
      "items": [
        {
          "type": "function",
          "name": "initialize",
          "inputs": [
            {
              "name": "owner",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "fee_recipient",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "fees_bps_0",
              "type": "core::integer::u128"
            },
            {
              "name": "fees_bps_1",
              "type": "core::integer::u128"
            },
            {
              "name": "swap_exact_token_to_fees_bps",
              "type": "core::integer::u128"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "get_adapter_class_hash",
          "inputs": [
            {
              "name": "exchange_address",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [
            {
              "type": "core::starknet::class_hash::ClassHash"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "set_adapter_class_hash",
          "inputs": [
            {
              "name": "exchange_address",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "adapter_class_hash",
              "type": "core::starknet::class_hash::ClassHash"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "get_external_solver_adapter_class_hash",
          "inputs": [
            {
              "name": "external_solver_address",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [
            {
              "type": "core::starknet::class_hash::ClassHash"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "set_external_solver_adapter_class_hash",
          "inputs": [
            {
              "name": "external_solver_address",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "adapter_class_hash",
              "type": "core::starknet::class_hash::ClassHash"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "multi_route_swap",
          "inputs": [
            {
              "name": "sell_token_address",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "sell_token_amount",
              "type": "core::integer::u256"
            },
            {
              "name": "buy_token_address",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "buy_token_amount",
              "type": "core::integer::u256"
            },
            {
              "name": "buy_token_min_amount",
              "type": "core::integer::u256"
            },
            {
              "name": "beneficiary",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "integrator_fee_amount_bps",
              "type": "core::integer::u128"
            },
            {
              "name": "integrator_fee_recipient",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "routes",
              "type": "core::array::Array::<avnu::models::Route>"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "swap_exact_token_to",
          "inputs": [
            {
              "name": "sell_token_address",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "sell_token_amount",
              "type": "core::integer::u256"
            },
            {
              "name": "sell_token_max_amount",
              "type": "core::integer::u256"
            },
            {
              "name": "buy_token_address",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "buy_token_amount",
              "type": "core::integer::u256"
            },
            {
              "name": "beneficiary",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "integrator_fee_amount_bps",
              "type": "core::integer::u128"
            },
            {
              "name": "integrator_fee_recipient",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "routes",
              "type": "core::array::Array::<avnu::models::Route>"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "swap_external_solver",
          "inputs": [
            {
              "name": "user_address",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "sell_token_address",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "buy_token_address",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "beneficiary",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "external_solver_address",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "external_solver_adapter_calldata",
              "type": "core::array::Array::<core::felt252>"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "external"
        }
      ]
    },
    {
      "type": "impl",
      "name": "FeeImpl",
      "interface_name": "avnu::components::fee::IFee"
    },
    {
      "type": "struct",
      "name": "avnu::components::fee::TokenFeeConfig",
      "members": [
        {
          "name": "weight",
          "type": "core::integer::u32"
        }
      ]
    },
    {
      "type": "interface",
      "name": "avnu::components::fee::IFee",
      "items": [
        {
          "type": "function",
          "name": "get_fees_recipient",
          "inputs": [],
          "outputs": [
            {
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "set_fees_recipient",
          "inputs": [
            {
              "name": "fees_recipient",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "get_fees_bps_0",
          "inputs": [],
          "outputs": [
            {
              "type": "core::integer::u128"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "set_fees_bps_0",
          "inputs": [
            {
              "name": "bps",
              "type": "core::integer::u128"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "get_fees_bps_1",
          "inputs": [],
          "outputs": [
            {
              "type": "core::integer::u128"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "set_fees_bps_1",
          "inputs": [
            {
              "name": "bps",
              "type": "core::integer::u128"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "get_swap_exact_token_to_fees_bps",
          "inputs": [],
          "outputs": [
            {
              "type": "core::integer::u128"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "set_swap_exact_token_to_fees_bps",
          "inputs": [
            {
              "name": "bps",
              "type": "core::integer::u128"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "get_token_fee_config",
          "inputs": [
            {
              "name": "token",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [
            {
              "type": "avnu::components::fee::TokenFeeConfig"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "set_token_fee_config",
          "inputs": [
            {
              "name": "token",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "config",
              "type": "avnu::components::fee::TokenFeeConfig"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "is_integrator_whitelisted",
          "inputs": [
            {
              "name": "integrator",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "set_whitelisted_integrator",
          "inputs": [
            {
              "name": "integrator",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "whitelisted",
              "type": "core::bool"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "external"
        }
      ]
    },
    {
      "type": "impl",
      "name": "OwnableImpl",
      "interface_name": "avnu_lib::components::ownable::IOwnable"
    },
    {
      "type": "interface",
      "name": "avnu_lib::components::ownable::IOwnable",
      "items": [
        {
          "type": "function",
          "name": "get_owner",
          "inputs": [],
          "outputs": [
            {
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "transfer_ownership",
          "inputs": [
            {
              "name": "new_owner",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        }
      ]
    },
    {
      "type": "impl",
      "name": "UpgradableImpl",
      "interface_name": "avnu_lib::components::upgradable::IUpgradable"
    },
    {
      "type": "interface",
      "name": "avnu_lib::components::upgradable::IUpgradable",
      "items": [
        {
          "type": "function",
          "name": "upgrade_class",
          "inputs": [
            {
              "name": "new_class_hash",
              "type": "core::starknet::class_hash::ClassHash"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        }
      ]
    },
    {
      "type": "constructor",
      "name": "constructor",
      "inputs": [
        {
          "name": "owner",
          "type": "core::starknet::contract_address::ContractAddress"
        },
        {
          "name": "fee_recipient",
          "type": "core::starknet::contract_address::ContractAddress"
        },
        {
          "name": "fees_bps_0",
          "type": "core::integer::u128"
        },
        {
          "name": "fees_bps_1",
          "type": "core::integer::u128"
        },
        {
          "name": "swap_exact_token_to_fees_bps",
          "type": "core::integer::u128"
        }
      ]
    },
    {
      "type": "event",
      "name": "avnu::components::fee::FeeComponent::Event",
      "kind": "enum",
      "variants": []
    },
    {
      "type": "event",
      "name": "avnu_lib::components::ownable::OwnableComponent::OwnershipTransferred",
      "kind": "struct",
      "members": [
        {
          "name": "previous_owner",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "key"
        },
        {
          "name": "new_owner",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "key"
        }
      ]
    },
    {
      "type": "event",
      "name": "avnu_lib::components::ownable::OwnableComponent::Event",
      "kind": "enum",
      "variants": [
        {
          "name": "OwnershipTransferred",
          "type": "avnu_lib::components::ownable::OwnableComponent::OwnershipTransferred",
          "kind": "nested"
        }
      ]
    },
    {
      "type": "event",
      "name": "avnu_lib::components::upgradable::UpgradableComponent::Upgraded",
      "kind": "struct",
      "members": [
        {
          "name": "class_hash",
          "type": "core::starknet::class_hash::ClassHash",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "avnu_lib::components::upgradable::UpgradableComponent::Event",
      "kind": "enum",
      "variants": [
        {
          "name": "Upgraded",
          "type": "avnu_lib::components::upgradable::UpgradableComponent::Upgraded",
          "kind": "nested"
        }
      ]
    },
    {
      "type": "event",
      "name": "avnu::exchange::Exchange::Swap",
      "kind": "struct",
      "members": [
        {
          "name": "taker_address",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        },
        {
          "name": "sell_address",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        },
        {
          "name": "sell_amount",
          "type": "core::integer::u256",
          "kind": "data"
        },
        {
          "name": "buy_address",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        },
        {
          "name": "buy_amount",
          "type": "core::integer::u256",
          "kind": "data"
        },
        {
          "name": "beneficiary",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "avnu::exchange::Exchange::Event",
      "kind": "enum",
      "variants": [
        {
          "name": "FeeEvent",
          "type": "avnu::components::fee::FeeComponent::Event",
          "kind": "flat"
        },
        {
          "name": "OwnableEvent",
          "type": "avnu_lib::components::ownable::OwnableComponent::Event",
          "kind": "flat"
        },
        {
          "name": "UpgradableEvent",
          "type": "avnu_lib::components::upgradable::UpgradableComponent::Event",
          "kind": "flat"
        },
        {
          "name": "Swap",
          "type": "avnu::exchange::Exchange::Swap",
          "kind": "nested"
        }
      ]
    }
  ]