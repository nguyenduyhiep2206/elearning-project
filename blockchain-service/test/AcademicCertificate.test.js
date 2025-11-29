const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AcademicCertificate", function () {
  let academicCertificate;
  let owner;
  let recipient;
  let otherAccount;

  beforeEach(async function () {
    [owner, recipient, otherAccount] = await ethers.getSigners();

    const AcademicCertificate = await ethers.getContractFactory("AcademicCertificate");
    academicCertificate = await AcademicCertificate.deploy(
      "Academic Certificate",
      "ACERT"
    );
    await academicCertificate.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await academicCertificate.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await academicCertificate.name()).to.equal("Academic Certificate");
      expect(await academicCertificate.symbol()).to.equal("ACERT");
    });
  });

  describe("Issue Certificate", function () {
    it("Should allow owner to issue certificate", async function () {
      const certificateId = 1;
      const tokenURI = "https://example.com/metadata/1.json";

      await expect(
        academicCertificate.issueCertificate(recipient.address, tokenURI, certificateId)
      )
        .to.emit(academicCertificate, "CertificateIssued")
        .withArgs(recipient.address, 1, certificateId, tokenURI);

      expect(await academicCertificate.ownerOf(1)).to.equal(recipient.address);
      expect(await academicCertificate.getTokenIdByCertificateId(certificateId)).to.equal(1);
      expect(await academicCertificate.getCertificateIdByTokenId(1)).to.equal(certificateId);
    });

    it("Should not allow non-owner to issue certificate", async function () {
      const certificateId = 1;
      const tokenURI = "https://example.com/metadata/1.json";

      await expect(
        academicCertificate.connect(otherAccount).issueCertificate(recipient.address, tokenURI, certificateId)
      ).to.be.revertedWithCustomError(academicCertificate, "OwnableUnauthorizedAccount");
    });

    it("Should not allow duplicate certificate IDs", async function () {
      const certificateId = 1;
      const tokenURI = "https://example.com/metadata/1.json";

      await academicCertificate.issueCertificate(recipient.address, tokenURI, certificateId);

      await expect(
        academicCertificate.issueCertificate(otherAccount.address, tokenURI, certificateId)
      ).to.be.revertedWith("AcademicCertificate: certificate ID already exists");
    });

    it("Should not allow zero address as recipient", async function () {
      const certificateId = 1;
      const tokenURI = "https://example.com/metadata/1.json";

      await expect(
        academicCertificate.issueCertificate(ethers.ZeroAddress, tokenURI, certificateId)
      ).to.be.revertedWith("AcademicCertificate: recipient cannot be zero address");
    });
  });

  describe("Soulbound - Non-transferable", function () {
    beforeEach(async function () {
      const certificateId = 1;
      const tokenURI = "https://example.com/metadata/1.json";
      await academicCertificate.issueCertificate(recipient.address, tokenURI, certificateId);
    });

    it("Should prevent transferFrom", async function () {
      await expect(
        academicCertificate.connect(recipient).transferFrom(recipient.address, otherAccount.address, 1)
      ).to.be.revertedWith("AcademicCertificate: Certificates are soulbound and cannot be transferred");
    });

    it("Should prevent safeTransferFrom", async function () {
      await expect(
        academicCertificate.connect(recipient).safeTransferFrom(recipient.address, otherAccount.address, 1)
      ).to.be.revertedWith("AcademicCertificate: Certificates are soulbound and cannot be transferred");
    });
  });

  describe("Mappings", function () {
    it("Should correctly map certificate ID to token ID", async function () {
      const certificateId = 123;
      const tokenURI = "https://example.com/metadata/123.json";

      await academicCertificate.issueCertificate(recipient.address, tokenURI, certificateId);

      expect(await academicCertificate.getTokenIdByCertificateId(certificateId)).to.equal(1);
      expect(await academicCertificate.getCertificateIdByTokenId(1)).to.equal(certificateId);
      expect(await academicCertificate.isCertificateIssued(certificateId)).to.be.true;
    });
  });

  describe("Total Supply", function () {
    it("Should return correct total supply", async function () {
      expect(await academicCertificate.totalSupply()).to.equal(0);

      await academicCertificate.issueCertificate(recipient.address, "uri1", 1);
      expect(await academicCertificate.totalSupply()).to.equal(1);

      await academicCertificate.issueCertificate(otherAccount.address, "uri2", 2);
      expect(await academicCertificate.totalSupply()).to.equal(2);
    });
  });
});

