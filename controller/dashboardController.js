const ConnectionRequest = require("../model/requestConnectionModel.js");

const dashboardController = async (req, res) => {
  try {
    const now = new Date();
    const year = req.query.year ? parseInt(req.query.year) : now.getFullYear();

    // =========================
    // 1. LAST 30 DAYS RANGE
    // =========================
    const last30Start = new Date();
    last30Start.setDate(now.getDate() - 30);

    const prev30Start = new Date();
    prev30Start.setDate(now.getDate() - 60);

    // =========================
    // 2. TOTAL STATS (ALL TIME)
    // =========================
    const totalStats = await ConnectionRequest.aggregate([
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          connected: {
            $sum: { $cond: [{ $eq: ["$status", "connected"] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          notPossible: {
            $sum: {
              $cond: [{ $eq: ["$status", "currently not possible"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const total = totalStats[0] || {
      totalRequests: 0,
      pending: 0,
      connected: 0,
      cancelled: 0,
      notPossible: 0,
    };

    // =========================
    // 3. STATUS DISTRIBUTION (%)
    // =========================
    const statusDistribution = [
      {
        name: "pending",
        value: total.pending,
        percent:
          total.totalRequests > 0
            ? parseFloat(
                ((total.pending / total.totalRequests) * 100).toFixed(1),
              )
            : 0,
      },
      {
        name: "connected",
        value: total.connected,
        percent:
          total.totalRequests > 0
            ? parseFloat(
                ((total.connected / total.totalRequests) * 100).toFixed(1),
              )
            : 0,
      },
      {
        name: "cancelled",
        value: total.cancelled,
        percent:
          total.totalRequests > 0
            ? parseFloat(
                ((total.cancelled / total.totalRequests) * 100).toFixed(1),
              )
            : 0,
      },
      {
        name: "not possible",
        value: total.notPossible,
        percent:
          total.totalRequests > 0
            ? parseFloat(
                ((total.notPossible / total.totalRequests) * 100).toFixed(1),
              )
            : 0,
      },
    ];

    // =========================
    // 4. MONTHLY TREND (YEAR FILTER)
    // =========================
    const monthlyRaw = await ConnectionRequest.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          connected: {
            $sum: { $cond: [{ $eq: ["$status", "connected"] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const monthlyTrend = monthlyRaw.map((item) => ({
      year: item._id.year,
      month: monthNames[item._id.month - 1],
      total: item.total,
      pending: item.pending,
      connected: item.connected,
      cancelled: item.cancelled,
    }));

    // =========================
    // 5. LAST 30 DAYS
    // =========================
    const last30Stats = await ConnectionRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: last30Start, $lte: now },
        },
      },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          connected: {
            $sum: { $cond: [{ $eq: ["$status", "connected"] }, 1, 0] },
          },
        },
      },
    ]);

    const last30 = last30Stats[0] || {
      totalRequests: 0,
      pending: 0,
      connected: 0,
    };

    // =========================
    // 6. PREVIOUS 30 DAYS
    // =========================
    const prev30Stats = await ConnectionRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: prev30Start, $lt: last30Start },
        },
      },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          connected: {
            $sum: { $cond: [{ $eq: ["$status", "connected"] }, 1, 0] },
          },
        },
      },
    ]);

    const prev30 = prev30Stats[0] || {
      totalRequests: 0,
      pending: 0,
      connected: 0,
    };

    // =========================
    // 7. GROWTH CALCULATOR
    // =========================
    const calcGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    // =========================
    // 8. KPI
    // =========================
    const kpi = {
      totalRequests: {
        value: total.totalRequests,
        change: parseFloat(
          calcGrowth(last30.totalRequests, prev30.totalRequests).toFixed(2),
        ),
      },
      pendingRequests: {
        value: total.pending,
        change: parseFloat(
          calcGrowth(last30.pending, prev30.pending).toFixed(2),
        ),
      },
      connectedUsers: {
        value: total.connected,
        change: parseFloat(
          calcGrowth(last30.connected, prev30.connected).toFixed(2),
        ),
      },
    };

    // =========================
    // FINAL RESPONSE
    // =========================
    return res.status(200).json({
      success: true,
      data: {
        kpi,
        statusDistribution,
        monthlyTrend,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
    });
  }
};

module.exports = { dashboardController };
