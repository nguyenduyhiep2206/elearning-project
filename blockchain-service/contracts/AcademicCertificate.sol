// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AcademicCertificate
 * @dev Soulbound NFT contract for academic certificates
 * @notice Certificates are non-transferable and bound to the recipient's wallet
 */
contract AcademicCertificate is ERC721URIStorage, Ownable {
    // Mapping from CertificateID (database) to TokenID (blockchain)
    mapping(uint256 => uint256) public certificateIdToTokenId;
    
    // Mapping from TokenID to CertificateID (reverse lookup)
    mapping(uint256 => uint256) public tokenIdToCertificateId;
    
    // Counter for token IDs
    uint256 private _tokenIdCounter;
    
    // Event emitted when a certificate is issued
    event CertificateIssued(
        address indexed recipient,
        uint256 indexed tokenId,
        uint256 indexed certificateId,
        string tokenURI
    );

    /**
     * @dev Constructor sets the contract deployer as the owner
     * @param name Name of the NFT collection
     * @param symbol Symbol of the NFT collection
     */
    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _tokenIdCounter = 1; // Start token IDs from 1
    }

    /**
     * @dev Issue a new certificate to a recipient
     * @notice Only the owner (school admin) can call this function
     * @param recipient Address of the certificate recipient
     * @param tokenURI URI pointing to the certificate metadata
     * @param certificateId The CertificateID from the database
     * @return tokenId The TokenID assigned on the blockchain
     */
    function issueCertificate(
        address recipient,
        string memory tokenURI,
        uint256 certificateId
    ) public onlyOwner returns (uint256) {
        require(recipient != address(0), "AcademicCertificate: recipient cannot be zero address");
        require(certificateIdToTokenId[certificateId] == 0, "AcademicCertificate: certificate ID already exists");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        // Mint the token to the recipient
        _safeMint(recipient, tokenId);
        
        // Set the token URI
        _setTokenURI(tokenId, tokenURI);
        
        // Store the mapping between CertificateID and TokenID
        certificateIdToTokenId[certificateId] = tokenId;
        tokenIdToCertificateId[tokenId] = certificateId;
        
        emit CertificateIssued(recipient, tokenId, certificateId, tokenURI);
        
        return tokenId;
    }

    /**
     * @dev Override _update to prevent transfers (Soulbound)
     * @notice Only allows minting (from == address(0)) and prevents all transfers
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from is zero address)
        if (from == address(0)) {
            return super._update(to, tokenId, auth);
        }
        
        // Prevent all transfers (revert if trying to transfer existing token)
        revert("AcademicCertificate: Certificates are soulbound and cannot be transferred");
    }

    /**
     * @dev Get the token ID for a given certificate ID
     * @param certificateId The CertificateID from the database
     * @return The corresponding TokenID on the blockchain
     */
    function getTokenIdByCertificateId(uint256 certificateId) public view returns (uint256) {
        return certificateIdToTokenId[certificateId];
    }

    /**
     * @dev Get the certificate ID for a given token ID
     * @param tokenId The TokenID on the blockchain
     * @return The corresponding CertificateID from the database
     */
    function getCertificateIdByTokenId(uint256 tokenId) public view returns (uint256) {
        return tokenIdToCertificateId[tokenId];
    }

    /**
     * @dev Get the total number of certificates issued
     * @return The total number of tokens minted
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter - 1;
    }

    /**
     * @dev Check if a certificate ID has been issued
     * @param certificateId The CertificateID from the database
     * @return True if the certificate has been issued
     */
    function isCertificateIssued(uint256 certificateId) public view returns (bool) {
        return certificateIdToTokenId[certificateId] != 0;
    }
}

