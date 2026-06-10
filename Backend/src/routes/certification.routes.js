const router = require('express').Router();
const { getCertifications, createCertification, updateCertification, deleteCertification } = require('../controllers/certification.controller');
const protect = require('../middleware/auth');

router.get('/', protect, getCertifications);
router.post('/', protect, createCertification);
router.patch('/:id', protect, updateCertification);
router.delete('/:id', protect, deleteCertification);

module.exports = router;