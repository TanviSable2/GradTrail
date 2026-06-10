const { getCertsByUser, createCert, updateCert, deleteCert } = require('../db/queries/certification.queries');

const listCerts = async (user_id) => {
  const result = await getCertsByUser(user_id);
  return result.rows;
};

const addCert = async (user_id, fields) => {
  const result = await createCert(user_id, fields);
  return result.rows[0];
};

const editCert = async (id, user_id, fields) => {
  const result = await updateCert(id, user_id, fields);
  if (!result.rows[0]) {
    const err = new Error('Certification not found or does not belong to you.');
    err.status = 404;
    throw err;
  }
  return result.rows[0];
};

const removeCert = async (id, user_id) => {
  const result = await deleteCert(id, user_id);
  if (!result.rows[0]) {
    const err = new Error('Certification not found or does not belong to you.');
    err.status = 404;
    throw err;
  }
  return { deleted: true };
};

module.exports = { listCerts, addCert, editCert, removeCert };