// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SecretNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    constructor(address initialOwner)
        ERC721("SecretNFT", "sNFT")
        Ownable(initialOwner)
    {}

    function _baseURI() internal pure override returns (string memory) {
        return "";
    }

  function safeMint(address to, string memory uri) public {
    uint256 tokenId = _nextTokenId++;
    _safeMint(to, tokenId);
    _setTokenURI(tokenId, uri);
}

    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        if (tokenCount == 0) {
            return tokenIds; // Return an empty array if no tokens
        } else {
            uint256 index = 0;
            for (uint256 i = 0; i < _nextTokenId; i++) {
                try this.ownerOf(i) {
                    if (ownerOf(i) == owner) {
                        tokenIds[index] = i;
                        index++;
                    }
                } catch {
                    // This catch block is intentionally left empty.
                    // If ownerOf(i) reverts, then the token does not exist, so do nothing.
                }
            }
            // Resize the array to remove unused elements
            uint256[] memory actualTokenIds = new uint256[](index);
            for (uint256 j = 0; j < index; j++) {
                actualTokenIds[j] = tokenIds[j];
            }
            return actualTokenIds;
        }
    }

    function totalSupply() public view returns (uint256) {
        return _nextTokenId;
    }

    // The following functions are overrides required by Solidity.
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
