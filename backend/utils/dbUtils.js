const { getCache, invalidateCache, setCache } = require("../helpers/cacheHelpers");
const { Op } = require("../helpers/helperFunctions");

const generateCacheKey = (model, whereClause) => {
    const modelName = model.name;
    const sortedWhereClause = Object.keys(whereClause)
        .sort()
        .reduce((acc, key) => {
            if (key === "date" && whereClause[key]?.[Op.between]) {
                const [fromDate, toDate] = whereClause[key][Op.between];
                acc.from_date = fromDate instanceof Date
                    ? fromDate.toISOString()
                    : fromDate;
                acc.to_date = toDate instanceof Date
                    ? toDate.toISOString()
                    : toDate;
                return acc;
            }

            if (
                key === "user_id" &&
                whereClause[key]?.[Op.in]
            ) {
                acc.user_ids = [...whereClause[key][Op.in]].sort();
                return acc;
            }

            acc[key] = whereClause[key];
            return acc;
        }, {});
    return `${modelName}:${JSON.stringify(sortedWhereClause)}`;
};

/**
 * Generic function to fetch a single record from a given model
 * @param {Object} model - Sequelize model
 * @param {Object} whereClause - Conditions for finding a record
 * @param {number} expiry - Expiry time in seconds (default: 3600s)
 */
const findOneRecord = async (model, whereClause, expiry = 3600) => {
    const cacheKey = generateCacheKey(model, whereClause);
    const cachedData = await getCache(cacheKey);
    if (cachedData) return cachedData;

    const result = await model.findOne({ where: whereClause })
    if (result) await setCache(cacheKey, result, expiry);
    return result;
};

/**
 * Generic function to fetch all records from a given model
 * @param {Object} model - Sequelize model
 * @param {Object} whereClause - Conditions for finding a record
 * @param {number} expiry - Expiry time in seconds (default: 3600s)
 */
const findAllRecords = async (model, whereClause, expiry = 3600) => {
    const cacheKey = generateCacheKey(model, whereClause);
    const cachedData = await getCache(cacheKey);
    if (cachedData) return cachedData;

    const result = await model.findAll({ where: whereClause })
    if (result.length > 0) await setCache(cacheKey, result, expiry);
    return result;
};

/**
 * Generic function to fetch all records from a given model
 * @param {Object} model - Sequelize model
 * @param {Object} whereClause - Conditions for finding a record
 * @param {number} expiry - Expiry time in seconds (default: 3600s)
 * @param {Array<string>} excludeFields - Fields to exclude from the result.
 * @param {Array<string>} orderBy - Sorting order.
 * @param {number} page - Page number for pagination (default: 1).
 * @param {number} limit - Number of records per page (default: 20).
 */
const findAllPaginatedRecords = async (model, whereClause, expiry = 3600, excludeFields = [], orderBy = [], page = 1, limit = 20) => {
    const cacheKey = generateCacheKey(model, whereClause);
    const cachedData = await getCache(cacheKey);
    if (cachedData) return cachedData;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    const attributes = excludeFields.length > 0 ? { exclude: excludeFields } : undefined;
    const offset = (page - 1) * limit; // Calculate offset for pagination

    const { count, rows } = await model.findAndCountAll({
        where: whereClause,
        attributes,
        order: orderBy.length > 0 ? [orderBy] : undefined,
        limit,
        offset
    });

    const pagination = {
        totalRecords: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        pageSize: limit,
    };

    const data = rows;

    if (rows.length > 0) await setCache(cacheKey, { pagination, data }, expiry);
    return { pagination: pagination, data: data };
};

/**
 * Generic function to create a new record in a given model
 * @param {Object} model - Sequelize model
 * @param {Object} data - Data for creating a new record
 * @param {String} cacheKey - Key to invalidate the record cache
 */
const createRecord = async (model, data, cacheKey) => {
    const result = await model.create(data);
    await invalidateCache(cacheKey);
    return result;
};

/**
 * Generic function to update a record in a given model
 * @param {Object} model - Sequelize model
 * @param {Object} whereClause - Conditions for finding the record to update
 * @param {Object} data - New data to update the record
 * @param {String} cacheKey - Key to invalidate the record cache
 */
const updateRecord = async (model, whereClause, data, cacheKey) => {
    const result = await model.update(data, { where: whereClause });

    if (result[0] > 0) {
        if (cacheKey) {
            await invalidateCache(cacheKey);
        }
    }
    return result;
};

/**
 * Generic function to delete a record from a given model
 * @param {Object} model - Sequelize model
 * @param {Object} whereClause - Conditions for finding the record to delete
 * @param {String} cacheKey - Key to invalidate the record cache
 */
const deleteRecord = async (model, whereClause, cacheKey) => {
    const result = await model.destroy({ where: whereClause });

    if (result > 0) {
        if (cacheKey) {
            await invalidateCache(cacheKey);
        }
    }
    return result;
};

module.exports = { findOneRecord, findAllRecords, findAllPaginatedRecords, createRecord, updateRecord, deleteRecord };
