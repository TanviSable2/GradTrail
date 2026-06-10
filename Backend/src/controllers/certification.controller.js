const certService = require('../services/certification.service');
const { validateRequired } = require('../utils/validateFields');

const getCertifications = async (req, res, next) => {
  try {
    const certs = await certService.listCerts(req.user.id);
    res.json(certs);
  } catch (err) {
    next(err);
  }
};

const createCertification = async (req, res, next) => {
  try {
    const missing = validateRequired(req.body, ['title']);
    if (missing) return res.status(400).json({ error: missing });

    const cert = await certService.addCert(req.user.id, req.body);
    res.status(201).json(cert);
  } catch (err) {
    next(err);
  }
};

const updateCertification = async (req, res, next) => {
  try {
    const cert = await certService.editCert(req.params.id, req.user.id, req.body);
    res.json(cert);
  } catch (err) {
    next(err);
  }
};

const deleteCertification = async (req, res, next) => {
  try {
    const result = await certService.removeCert(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getCertifications, createCertification, updateCertification, deleteCertification };