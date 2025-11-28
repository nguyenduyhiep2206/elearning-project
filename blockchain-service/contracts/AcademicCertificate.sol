// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AcademicCertificate
 * @notice ERC721 soulbound certificate contract for academic credentials.
 */
contract AcademicCertificate is ERC721URIStorage, Ownable {
    error SoulboundToken();
    error CertificateAlreadyMapped();

    uint256 private _nextTokenId = 1;
    mapping(uint256 => uint256) private _certificateIdToTokenId;
    mapping(uint256 => bool) private _certificateIdExists;

    constructor(address admin) ERC721("AcademicCertificate", "ACERT") Ownable(admin) {}

    /**
     * @notice Issue a certificate where the database certificate id matches the on-chain token id.
     */
    function issueCertificate(address recipient, string memory tokenURI) external onlyOwner returns (uint256) {
        uint256 newTokenId = _mintCertificate(recipient, tokenURI);
        if (_certificateIdExists[newTokenId]) {
            revert CertificateAlreadyMapped();
        }

        _certificateIdExists[newTokenId] = true;
        _certificateIdToTokenId[newTokenId] = newTokenId;
        emit CertificateLinked(newTokenId, newTokenId);
        return newTokenId;
    }

    /**
     * @notice Issue a certificate while explicitly linking an off-chain certificate id.
     */
    function issueCertificateWithId(
        address recipient,
        string memory tokenURI,
        uint256 certificateId
    ) external onlyOwner returns (uint256) {
        if (_certificateIdExists[certificateId]) {
            revert CertificateAlreadyMapped();
        }

        uint256 newTokenId = _mintCertificate(recipient, tokenURI);
        _certificateIdExists[certificateId] = true;
        _certificateIdToTokenId[certificateId] = newTokenId;
        emit CertificateLinked(certificateId, newTokenId);
        return newTokenId;
    }

    function getTokenIdByCertificateId(uint256 certificateId) external view returns (uint256) {
        return _certificateIdToTokenId[certificateId];
    }

    function _mintCertificate(address recipient, string memory tokenURI) private returns (uint256) {
        uint256 newTokenId = _nextTokenId;
        _nextTokenId += 1;
        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        return newTokenId;
    }

    function transferFrom(address, address, uint256) public pure override(ERC721, IERC721) {
        revert SoulboundToken();
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override(ERC721, IERC721) {
        revert SoulboundToken();
    }

    event CertificateLinked(uint256 indexed certificateId, uint256 indexed tokenId);
}

