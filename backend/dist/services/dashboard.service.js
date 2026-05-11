"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServicePartnerDashboardOptimized = exports.getDashboardOverviewOptimized = void 0;
const transaction_enum_1 = require("../enums/transaction.enum");
const userRole_enum_1 = require("../enums/userRole.enum");
const RoleRepository = __importStar(require("../repositories/role.repository"));
const sequelize_1 = require("sequelize");
const dashboard_repository_1 = require("../repositories/dashboard.repository");
const PERIOD_DAYS = {
    week: 7,
    month: 30,
    year: 365,
};
const KPI_COMPARE_LABEL = "Then Last Week";
const SERVICE_COLORS = ["#4EA8DE", "#F4A261", "#34C38F", "#C77DFF", "#8E7CFF"];
const CITY_COLORS = ["#F2A452", "#8E7CFF", "#34C38F", "#4EA8DE", "#E76F51"];
const buildRange = (period) => {
    const now = new Date();
    if (period === "year") {
        const currentStart = new Date(now);
        currentStart.setMonth(now.getMonth() - 11, 1);
        currentStart.setHours(0, 0, 0, 0);
        const currentEnd = new Date(now);
        currentEnd.setHours(23, 59, 59, 999);
        const previousEnd = new Date(currentStart);
        previousEnd.setMilliseconds(previousEnd.getMilliseconds() - 1);
        const previousStart = new Date(previousEnd);
        previousStart.setMonth(previousEnd.getMonth() - 11, 1);
        previousStart.setHours(0, 0, 0, 0);
        return {
            days: 365,
            currentStart,
            currentEnd,
            previousStart,
            previousEnd,
        };
    }
    const days = PERIOD_DAYS[period];
    const currentStart = new Date(now);
    currentStart.setDate(now.getDate() - (days - 1));
    currentStart.setHours(0, 0, 0, 0);
    const currentEnd = new Date(now);
    currentEnd.setHours(23, 59, 59, 999);
    const previousEnd = new Date(currentStart);
    previousEnd.setMilliseconds(previousEnd.getMilliseconds() - 1);
    const previousStart = new Date(previousEnd);
    previousStart.setDate(previousEnd.getDate() - (days - 1));
    previousStart.setHours(0, 0, 0, 0);
    return { days, currentStart, currentEnd, previousStart, previousEnd };
};
const calculateChange = (current, previous) => {
    if (current === 0 && previous === 0) {
        return { percent: 0, positive: true };
    }
    if (previous === 0) {
        return { percent: current > 0 ? 100 : 0, positive: current >= 0 };
    }
    const percent = ((current - previous) / previous) * 100;
    const cappedPercent = Math.max(-100, Math.min(100, percent));
    return { percent: cappedPercent, positive: cappedPercent >= 0 };
};
const formatCompactNumber = (value) => {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
    }
    return `${Math.round(value)}`;
};
const formatChangeString = (percent) => {
    const rounded = Math.round(percent);
    return `${rounded >= 0 ? "+" : ""}${rounded}%`;
};
const getBucketLabels = (period, yearStart) => {
    if (period === "week")
        return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    if (period === "month")
        return ["Week 1", "Week 2", "Week 3", "Week 4"];
    const start = yearStart !== null && yearStart !== void 0 ? yearStart : new Date();
    const labels = [];
    for (let i = 0; i < 12; i += 1) {
        const d = new Date(start);
        d.setMonth(start.getMonth() + i, 1);
        labels.push(d.toLocaleString("en-US", { month: "short" }));
    }
    return labels;
};
const getBucketIndex = (date, period, yearStart) => {
    if (period === "week") {
        const day = date.getDay();
        return day === 0 ? 6 : day - 1;
    }
    if (period === "month") {
        const dayOfMonth = date.getDate();
        if (dayOfMonth <= 7)
            return 0;
        if (dayOfMonth <= 14)
            return 1;
        if (dayOfMonth <= 21)
            return 2;
        return 3;
    }
    const start = yearStart !== null && yearStart !== void 0 ? yearStart : new Date(date.getFullYear(), 0, 1);
    const months = (date.getFullYear() - start.getFullYear()) * 12 +
        (date.getMonth() - start.getMonth());
    return Math.max(0, Math.min(11, months));
};
const pickCity = (address) => {
    if (!address)
        return "Unknown";
    const parts = address
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
    return parts.length ? parts[parts.length - 1] : "Unknown";
};
/**
 * @name getDashboardOverviewOptimized
 * @description Returns admin dashboard response with week/month/year chart sections in one call.
 *              KPIs and topPartners are returned once (derived from the "week" payload).
 * @access Private
 */
const getDashboardOverviewOptimized = () => __awaiter(void 0, void 0, void 0, function* () {
    // ================= RANGES =================
    const ranges = {
        week: buildRange("week"),
        month: buildRange("month"),
        year: buildRange("year"),
    };
    const yearRange = ranges.year;
    // ================= COMMON DATA =================
    const customerRoleId = yield RoleRepository.getRoleIdByName(userRole_enum_1.UserRole.CUSTOMER);
    if (!customerRoleId) {
        throw new Error("CUSTOMER role not configured properly");
    }
    const [allBookings, topPartnerRowsRaw, allTimeBookingsCount, allTimeUsersCount, allTimePartnersCount, allTimeRevenueRaw, weekBookingsCount, lastWeekBookingsCount, weekUsersCount, lastWeekUsersCount, weekPartnersCount, lastWeekPartnersCount, weekRevenueRaw, lastWeekRevenueRaw,] = yield Promise.all([
        // ONLY ONE MAIN QUERY (YEAR DATA)
        dashboard_repository_1.dashboardRepository.getBookingsWithRelations(yearRange.currentStart, yearRange.currentEnd),
        dashboard_repository_1.dashboardRepository.getTopPartnersRaw(),
        dashboard_repository_1.dashboardRepository.countCompletedBookings(),
        dashboard_repository_1.dashboardRepository.countUsers({ roleId: customerRoleId }),
        dashboard_repository_1.dashboardRepository.countPartners(),
        dashboard_repository_1.dashboardRepository.sumRevenue(),
        // KPI (week vs last week)
        dashboard_repository_1.dashboardRepository.countBookings({
            status: transaction_enum_1.BookingStatus.COMPLETED,
            createdAt: {
                [sequelize_1.Op.between]: [ranges.week.currentStart, ranges.week.currentEnd],
            },
        }),
        dashboard_repository_1.dashboardRepository.countBookings({
            status: transaction_enum_1.BookingStatus.COMPLETED,
            createdAt: {
                [sequelize_1.Op.between]: [ranges.week.previousStart, ranges.week.previousEnd],
            },
        }),
        dashboard_repository_1.dashboardRepository.countUsers({
            roleId: customerRoleId,
            createdAt: {
                [sequelize_1.Op.between]: [ranges.week.currentStart, ranges.week.currentEnd],
            },
        }),
        dashboard_repository_1.dashboardRepository.countUsers({
            roleId: customerRoleId,
            createdAt: {
                [sequelize_1.Op.between]: [ranges.week.previousStart, ranges.week.previousEnd],
            },
        }),
        dashboard_repository_1.dashboardRepository.countPartners({
            createdAt: {
                [sequelize_1.Op.between]: [ranges.week.currentStart, ranges.week.currentEnd],
            },
        }),
        dashboard_repository_1.dashboardRepository.countPartners({
            createdAt: {
                [sequelize_1.Op.between]: [ranges.week.previousStart, ranges.week.previousEnd],
            },
        }),
        dashboard_repository_1.dashboardRepository.sumRevenue({
            createdAt: {
                [sequelize_1.Op.between]: [ranges.week.currentStart, ranges.week.currentEnd],
            },
        }),
        dashboard_repository_1.dashboardRepository.sumRevenue({
            createdAt: {
                [sequelize_1.Op.between]: [ranges.week.previousStart, ranges.week.previousEnd],
            },
        }),
    ]);
    // ================= FILTER BOOKINGS =================
    const filter = (start, end) => allBookings.filter((b) => new Date(b.createdAt) >= start && new Date(b.createdAt) <= end);
    const bookingsByPeriod = {
        week: filter(ranges.week.currentStart, ranges.week.currentEnd),
        month: filter(ranges.month.currentStart, ranges.month.currentEnd),
        year: allBookings,
    };
    // ================= KPI =================
    const weekRevenue = Number(weekRevenueRaw !== null && weekRevenueRaw !== void 0 ? weekRevenueRaw : 0);
    const lastWeekRevenue = Number(lastWeekRevenueRaw !== null && lastWeekRevenueRaw !== void 0 ? lastWeekRevenueRaw : 0);
    const bookingsChange = calculateChange(weekBookingsCount, lastWeekBookingsCount);
    const usersChange = calculateChange(weekUsersCount, lastWeekUsersCount);
    const partnersChange = calculateChange(weekPartnersCount, lastWeekPartnersCount);
    const revenueChange = calculateChange(weekRevenue, lastWeekRevenue);
    const kpis = [
        {
            key: "bookings",
            title: "Total Services Booked",
            value: formatCompactNumber(allTimeBookingsCount),
            change: formatChangeString(bookingsChange.percent),
            changePercent: Math.round(bookingsChange.percent),
            positive: bookingsChange.positive,
            iconKey: "calendar",
        },
        {
            key: "users",
            title: "Active Users",
            value: formatCompactNumber(allTimeUsersCount),
            change: formatChangeString(usersChange.percent),
            changePercent: Math.round(usersChange.percent),
            positive: usersChange.positive,
            iconKey: "users",
        },
        {
            key: "partners",
            title: "Active Service Partners",
            value: formatCompactNumber(allTimePartnersCount),
            change: formatChangeString(partnersChange.percent),
            changePercent: Math.round(partnersChange.percent),
            positive: partnersChange.positive,
            iconKey: "wrench",
        },
        {
            key: "revenue",
            title: "Total Revenue",
            value: formatCompactNumber(Number(allTimeRevenueRaw !== null && allTimeRevenueRaw !== void 0 ? allTimeRevenueRaw : 0)),
            change: formatChangeString(revenueChange.percent),
            changePercent: Math.round(revenueChange.percent),
            positive: revenueChange.positive,
            iconKey: "dollar",
        },
    ];
    // ================= TOP SERVICES =================
    const buildTopServices = (bookings) => {
        const map = new Map();
        bookings.forEach((b) => {
            var _a, _b;
            const name = ((_a = b.serviceType) === null || _a === void 0 ? void 0 : _a.name) ||
                "Unknown";
            map.set(name, ((_b = map.get(name)) !== null && _b !== void 0 ? _b : 0) + 1);
        });
        const services = [...map.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([label, value], idx) => ({
            label,
            value,
            color: SERVICE_COLORS[idx % SERVICE_COLORS.length],
        }));
        return {
            totalBookings: bookings.length,
            services,
        };
    };
    // ================= REVENUE =================
    const buildRevenue = (bookings, period) => {
        const baseDate = period === "year" ? ranges.year.currentStart : undefined;
        const labels = getBucketLabels(period, baseDate);
        const buckets = new Array(labels.length).fill(0);
        bookings.forEach((b) => {
            var _a;
            const idx = getBucketIndex(new Date(b.createdAt), period, baseDate);
            buckets[idx] += Number((_a = b.amount) !== null && _a !== void 0 ? _a : 0);
        });
        const bars = labels.map((label, i) => ({
            label,
            amount: Math.round(buckets[i]),
        }));
        const max = Math.max(...bars.map((b) => b.amount), 0);
        const step = max > 0 ? Math.ceil(max / 5) : 1;
        return {
            bars,
            yTicks: [0, step, step * 2, step * 3, step * 4, step * 5],
            yTickLabels: [0, step, step * 2, step * 3, step * 4, step * 5].map((t, i) => (i === 0 ? "0" : `₹${formatCompactNumber(t)}`)),
        };
    };
    // ================= TOP CITIES =================
    const buildTopCities = (bookings, period) => {
        const baseDate = period === "year" ? ranges.year.currentStart : undefined;
        const labels = getBucketLabels(period, baseDate);
        const map = new Map();
        bookings.forEach((b) => {
            const partner = b.servicePartner;
            const city = pickCity((partner === null || partner === void 0 ? void 0 : partner.residentialAddress) || (partner === null || partner === void 0 ? void 0 : partner.permanentAddress));
            if (!map.has(city)) {
                map.set(city, new Array(labels.length).fill(0));
            }
            const idx = getBucketIndex(new Date(b.createdAt), period, baseDate);
            map.get(city)[idx] += 1;
        });
        const series = [...map.entries()]
            .sort((a, b) => b[1].reduce((s, x) => s + x, 0) - a[1].reduce((s, x) => s + x, 0))
            .slice(0, 5)
            .map(([name, data], idx) => ({
            name,
            data,
            color: CITY_COLORS[idx % CITY_COLORS.length],
        }));
        const max = Math.max(...series.flatMap((s) => s.data), 0);
        const step = max > 0 ? Math.ceil(max / 5) : 1;
        return {
            xLabels: labels,
            series,
            yTicks: [0, step, step * 2, step * 3, step * 4, step * 5],
        };
    };
    // ================= TOP PARTNERS =================
    const partnerMap = new Map();
    topPartnerRowsRaw.forEach((row) => {
        const id = Number(row.servicePartnerId);
        if (!Number.isFinite(id))
            return;
        partnerMap.set(id, Number(row.bookingCount) || 0);
    });
    const partnerIds = [...partnerMap.keys()];
    const profiles = yield dashboard_repository_1.dashboardRepository.getPartnersWithUsers(partnerIds);
    const profileMap = new Map(profiles.map((p) => {
        var _a, _b, _c, _d;
        return [
            p.id,
            {
                name: (_b = (_a = p.user) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : `Partner #${p.id}`,
                avatar: (_d = (_c = p.user) === null || _c === void 0 ? void 0 : _c.profileImage) !== null && _d !== void 0 ? _d : null,
            },
        ];
    }));
    const topPartners = partnerIds.map((partnerId) => {
        var _a, _b, _c, _d, _e;
        return ({
            name: (_b = (_a = profileMap.get(partnerId)) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : `Partner #${partnerId}`,
            role: "Service Partner",
            completed: (_c = partnerMap.get(partnerId)) !== null && _c !== void 0 ? _c : 0,
            avatar: (_e = (_d = profileMap.get(partnerId)) === null || _d === void 0 ? void 0 : _d.avatar) !== null && _e !== void 0 ? _e : null,
        });
    });
    // ================= FINAL RESPONSE =================
    return {
        comparisonLabel: KPI_COMPARE_LABEL,
        kpis,
        topPartners,
        topServices: {
            week: buildTopServices(bookingsByPeriod.week),
            month: buildTopServices(bookingsByPeriod.month),
            year: buildTopServices(bookingsByPeriod.year),
        },
        revenue: {
            week: buildRevenue(bookingsByPeriod.week, "week"),
            month: buildRevenue(bookingsByPeriod.month, "month"),
            year: buildRevenue(bookingsByPeriod.year, "year"),
        },
        topCities: {
            week: buildTopCities(bookingsByPeriod.week, "week"),
            month: buildTopCities(bookingsByPeriod.month, "month"),
            year: buildTopCities(bookingsByPeriod.year, "year"),
        },
    };
});
exports.getDashboardOverviewOptimized = getDashboardOverviewOptimized;
/**
 * @name getServicePartnerDashboardOptimized
 * @description Returns service partner dashboard response with week/month/year chart sections in one call.
 *              KPIs are returned once (derived from the "week" payload).
 * @access Private
 */
const getServicePartnerDashboardOptimized = (servicePartnerId) => __awaiter(void 0, void 0, void 0, function* () {
    // ================= RANGES =================
    const ranges = {
        week: buildRange("week"),
        month: buildRange("month"),
        year: buildRange("year"),
    };
    const yearRange = ranges.year;
    const kpiRange = ranges.week;
    // ================= COMMON DATA =================
    const [subCategories, completedBookingsCount, futureBookingsCount, allBookings, weekCompletedCount, lastWeekCompletedCount, weekFutureCount, lastWeekFutureCount,] = yield Promise.all([
        dashboard_repository_1.dashboardRepository.getPartnerSubCategories(servicePartnerId),
        dashboard_repository_1.dashboardRepository.countBookings({
            servicePartnerId,
            status: transaction_enum_1.BookingStatus.COMPLETED,
        }),
        dashboard_repository_1.dashboardRepository.countBookings({
            servicePartnerId,
            status: {
                [sequelize_1.Op.in]: [transaction_enum_1.BookingStatus.PENDING, transaction_enum_1.BookingStatus.CONFIRMED],
            },
        }),
        //single main bookings query (year)
        dashboard_repository_1.dashboardRepository.getPartnerBookings(servicePartnerId, yearRange.currentStart, yearRange.currentEnd),
        dashboard_repository_1.dashboardRepository.countBookings({
            servicePartnerId,
            status: transaction_enum_1.BookingStatus.COMPLETED,
            createdAt: {
                [sequelize_1.Op.between]: [kpiRange.currentStart, kpiRange.currentEnd],
            },
        }),
        dashboard_repository_1.dashboardRepository.countBookings({
            servicePartnerId,
            status: transaction_enum_1.BookingStatus.COMPLETED,
            createdAt: {
                [sequelize_1.Op.between]: [kpiRange.previousStart, kpiRange.previousEnd],
            },
        }),
        dashboard_repository_1.dashboardRepository.countBookings({
            servicePartnerId,
            status: {
                [sequelize_1.Op.in]: [transaction_enum_1.BookingStatus.PENDING, transaction_enum_1.BookingStatus.CONFIRMED],
            },
            createdAt: {
                [sequelize_1.Op.between]: [kpiRange.currentStart, kpiRange.currentEnd],
            },
        }),
        dashboard_repository_1.dashboardRepository.countBookings({
            servicePartnerId,
            status: {
                [sequelize_1.Op.in]: [transaction_enum_1.BookingStatus.PENDING, transaction_enum_1.BookingStatus.CONFIRMED],
            },
            createdAt: {
                [sequelize_1.Op.between]: [kpiRange.previousStart, kpiRange.previousEnd],
            },
        }),
    ]);
    // ================= FILTER BOOKINGS =================
    const filterBookings = (start, end) => allBookings.filter((booking) => {
        const time = new Date(booking.createdAt).getTime();
        return time >= start.getTime() && time <= end.getTime();
    });
    const bookingsByPeriod = {
        week: filterBookings(ranges.week.currentStart, ranges.week.currentEnd),
        month: filterBookings(ranges.month.currentStart, ranges.month.currentEnd),
        year: allBookings,
    };
    // ================= KPI =================
    const subCategoryIds = subCategories.map((s) => s.subCategoryId);
    const activeServicesCount = yield dashboard_repository_1.dashboardRepository.countServicesBySubCategories(subCategoryIds);
    const completedChange = calculateChange(weekCompletedCount, lastWeekCompletedCount);
    const futureChange = calculateChange(weekFutureCount, lastWeekFutureCount);
    const kpis = [
        {
            key: "active_services",
            title: "Active Services Offered",
            value: formatCompactNumber(Number(activeServicesCount)),
            change: formatChangeString(0),
            changePercent: 0,
            positive: true,
            iconKey: "wrench",
        },
        {
            key: "completed_services",
            title: "Completed Services",
            value: formatCompactNumber(completedBookingsCount),
            change: formatChangeString(completedChange.percent),
            changePercent: Math.round(completedChange.percent),
            positive: completedChange.positive,
            iconKey: "badge-check",
        },
        {
            key: "future_bookings",
            title: "Future Bookings",
            value: formatCompactNumber(futureBookingsCount),
            change: formatChangeString(futureChange.percent),
            changePercent: Math.round(futureChange.percent),
            positive: futureChange.positive,
            iconKey: "calendar",
        },
    ];
    // ================= SHARED BUILDER =================
    const buildDashboardSection = (bookings, period) => {
        const serviceBookingMap = new Map();
        const serviceRevenueMap = new Map();
        const labels = getBucketLabels(period, period === "year" ? ranges.year.currentStart : undefined);
        const revenueBuckets = new Array(labels.length).fill(0);
        bookings.forEach((booking) => {
            var _a, _b, _c, _d;
            const serviceName = ((_a = booking.service) === null || _a === void 0 ? void 0 : _a.name) ||
                "Unknown Service";
            serviceBookingMap.set(serviceName, ((_b = serviceBookingMap.get(serviceName)) !== null && _b !== void 0 ? _b : 0) + 1);
            const amount = Number((_c = booking.amount) !== null && _c !== void 0 ? _c : 0);
            serviceRevenueMap.set(serviceName, ((_d = serviceRevenueMap.get(serviceName)) !== null && _d !== void 0 ? _d : 0) + amount);
            const idx = getBucketIndex(new Date(booking.createdAt), period, period === "year" ? ranges.year.currentStart : undefined);
            revenueBuckets[idx] += amount;
        });
        const topServices = [...serviceBookingMap.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([label, value], idx) => ({
            label,
            value,
            color: SERVICE_COLORS[idx % SERVICE_COLORS.length],
        }));
        const topRevenueServices = [...serviceRevenueMap.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([label, value], idx) => {
            var _a;
            return ({
                label,
                value,
                bookings: (_a = serviceBookingMap.get(label)) !== null && _a !== void 0 ? _a : 0,
                color: CITY_COLORS[idx % CITY_COLORS.length],
            });
        });
        const bars = labels.map((label, idx) => {
            var _a;
            return ({
                label,
                amount: Math.round((_a = revenueBuckets[idx]) !== null && _a !== void 0 ? _a : 0),
            });
        });
        const maxBar = Math.max(...bars.map((b) => b.amount), 0);
        const step = maxBar > 0 ? Math.ceil(maxBar / 5) : 1;
        const yTicks = [0, step, step * 2, step * 3, step * 4, step * 5];
        const yTickLabels = yTicks.map((tick, idx) => idx === 0 ? "0" : `₹${formatCompactNumber(tick)}`);
        return {
            topServices: {
                totalBookings: bookings.length,
                services: topServices,
            },
            topRevenueServices: {
                totalBookings: bookings.length,
                services: topRevenueServices,
            },
            revenue: {
                bars,
                yTicks,
                yTickLabels,
            },
        };
    };
    const weekData = buildDashboardSection(bookingsByPeriod.week, "week");
    const monthData = buildDashboardSection(bookingsByPeriod.month, "month");
    const yearData = buildDashboardSection(bookingsByPeriod.year, "year");
    // ================= FINAL RESPONSE =================
    return {
        comparisonLabel: KPI_COMPARE_LABEL,
        kpis,
        topServices: {
            week: weekData.topServices,
            month: monthData.topServices,
            year: yearData.topServices,
        },
        topRevenueServices: {
            week: weekData.topRevenueServices,
            month: monthData.topRevenueServices,
            year: yearData.topRevenueServices,
        },
        revenue: {
            week: weekData.revenue,
            month: monthData.revenue,
            year: yearData.revenue,
        },
    };
});
exports.getServicePartnerDashboardOptimized = getServicePartnerDashboardOptimized;
