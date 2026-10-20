/**
 * SPARKWING PRICING CONFIG
 * Edit PHP and AUD values here. Leave a value null to hide that currency's price.
 * Set showPrices to false to hide every price on the site at once.
 */
const SPARKWING_PRICING = {
  showPrices: true,

  products: {
    sparkCheck: {
      id: "spark-check",
      free: true,
      php: null,
      aud: null,
    },
    studio: {
      id: "studio",
      from: true,
      php: 45000,
      aud: 1200,
    },
    carePlans: {
      id: "care-plans",
      from: true,
      monthly: true,
      php: 7000,
      aud: 190,
    },
    sparkkeeping: {
      id: "sparkkeeping",
      from: true,
      monthly: true,
      php: 1500,
      aud: 40,
    },
    academy: {
      id: "academy",
      from: true,
      php: 25000,
      aud: 700,
    },
    hive: {
      id: "hive",
      includedWithBuild: true,
      php: null,
      aud: null,
    },
  },
};
