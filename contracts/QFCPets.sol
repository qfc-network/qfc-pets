// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title QFC AI Pets — On-chain pet ownership, breeding & battle records
contract QFCPets {
    // ── Pet data ───────────────────────────────────────
    struct Pet {
        string name;
        uint8 species;    // 0=dragon,1=phoenix,2=wolf,3=cat,4=rabbit
        uint8 element;    // 0=fire,1=water,2=earth,3=lightning,4=shadow
        uint8 level;
        uint8 generation;
        uint256 parent1;  // 0 = genesis (no parent)
        uint256 parent2;
        address owner;
        uint256 bornAt;
    }

    uint256 public nextPetId = 1; // start at 1, 0 = no parent
    mapping(uint256 => Pet) public pets;
    mapping(address => uint256[]) public ownedPets;

    // ── Battle records ─────────────────────────────────
    mapping(address => uint256) public wins;
    mapping(address => uint256) public losses;

    // ── Breeding cooldown ──────────────────────────────
    mapping(uint256 => uint256) public breedCooldown; // petId => timestamp

    // ── Events ─────────────────────────────────────────
    event PetMinted(address indexed owner, uint256 indexed petId, string name, uint8 species, uint8 element, uint8 generation);
    event PetBred(address indexed owner, uint256 indexed childId, uint256 parent1, uint256 parent2);
    event BattleResult(uint256 indexed winnerId, uint256 indexed loserId, address winnerOwner, address loserOwner);
    event PetTransferred(uint256 indexed petId, address indexed from, address indexed to);

    /// @notice Mint a genesis pet (generation 0)
    function mintPet(string calldata name) external returns (uint256 petId) {
        petId = nextPetId++;
        uint256 seed = uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), msg.sender, petId)));

        uint8 species = uint8(seed % 5);
        uint8 element = uint8((seed >> 8) % 5);

        pets[petId] = Pet(name, species, element, 1, 0, 0, 0, msg.sender, block.timestamp);
        ownedPets[msg.sender].push(petId);

        emit PetMinted(msg.sender, petId, name, species, element, 0);
    }

    /// @notice Breed two pets you own
    function breed(uint256 parent1Id, uint256 parent2Id, string calldata childName) external returns (uint256 childId) {
        require(pets[parent1Id].owner == msg.sender, "Not owner of parent1");
        require(pets[parent2Id].owner == msg.sender, "Not owner of parent2");
        require(parent1Id != parent2Id, "Cannot breed with self");
        require(block.timestamp >= breedCooldown[parent1Id], "Parent1 on cooldown");
        require(block.timestamp >= breedCooldown[parent2Id], "Parent2 on cooldown");

        childId = nextPetId++;
        uint256 seed = uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), msg.sender, childId)));

        // Child inherits one parent's species, random element
        uint8 species = seed % 2 == 0 ? pets[parent1Id].species : pets[parent2Id].species;
        uint8 element = uint8((seed >> 8) % 5);
        uint8 gen = pets[parent1Id].generation > pets[parent2Id].generation
            ? pets[parent1Id].generation + 1
            : pets[parent2Id].generation + 1;

        pets[childId] = Pet(childName, species, element, 1, gen, parent1Id, parent2Id, msg.sender, block.timestamp);
        ownedPets[msg.sender].push(childId);

        // 1 hour cooldown
        breedCooldown[parent1Id] = block.timestamp + 1 hours;
        breedCooldown[parent2Id] = block.timestamp + 1 hours;

        emit PetBred(msg.sender, childId, parent1Id, parent2Id);
    }

    /// @notice Record a battle result
    function recordBattle(uint256 winnerId, uint256 loserId) external {
        address winOwner = pets[winnerId].owner;
        address loseOwner = pets[loserId].owner;
        require(winOwner != address(0) && loseOwner != address(0), "Invalid pets");

        wins[winOwner]++;
        losses[loseOwner]++;

        emit BattleResult(winnerId, loserId, winOwner, loseOwner);
    }

    /// @notice Transfer pet to another address
    function transfer(uint256 petId, address to) external {
        require(pets[petId].owner == msg.sender, "Not owner");
        require(to != address(0), "Invalid address");

        pets[petId].owner = to;
        ownedPets[to].push(petId);

        // Remove from sender's list (swap-and-pop)
        uint256[] storage senderPets = ownedPets[msg.sender];
        for (uint256 i = 0; i < senderPets.length; i++) {
            if (senderPets[i] == petId) {
                senderPets[i] = senderPets[senderPets.length - 1];
                senderPets.pop();
                break;
            }
        }

        emit PetTransferred(petId, msg.sender, to);
    }

    /// @notice Get pet count for an owner
    function petCount(address owner) external view returns (uint256) {
        return ownedPets[owner].length;
    }
}
