// BillPocket — constants & static rule tables
// Classic (non-module) script. Loaded in dependency order from index.html.
// Shares the global scope with the other js/*.js files; do not add import/export.

const STORAGE_KEY = "billpocket.bills.v1";
const CATEGORY_KEY = "billpocket.categories.v1";
const REMINDER_KEY = "billpocket.reminders.v1";
const THEME_KEY = "billpocket.theme.v1";
const STATEMENT_KEY = "billpocket.statementTransactions.v1";
const BUDGET_KEY = "billpocket.budgets.v1";
const GOAL_KEY = "billpocket.goals.v1";
const CANCEL_KEY = "billpocket.cancelPlanner.v1";
const ACCOUNT_KEY = "billpocket.accountSettings.v1";
const SIMULATOR_KEY = "billpocket.simulatorScenarios.v1";
const CATEGORY_RULES_KEY = "billpocket.categoryRules.v1";
const defaultCategories = ["Housing", "Utilities", "Entertainment", "Health", "Transport", "Learning", "Other"];
const defaultOwnAccounts = ["HSBC", "Lloyds", "Revolut", "Monzo"];
const defaultAccountSettings = {
  accounts: defaultOwnAccounts,
  transferWindowDays: 2,
  amountTolerancePercent: 1.5,
};
const statementCategoryRules = [
  { category: "Groceries", words: ["tesco", "sainsbury", "asda", "aldi", "lidl", "morrisons", "waitrose", "grocery", "supermarket"] },
  { category: "Dining", words: ["restaurant", "cafe", "coffee", "starbucks", "costa", "mcdonald", "kfc", "deliveroo", "ubereats", "just eat", "takeaway"] },
  { category: "Transport", words: ["uber", "bolt", "train", "rail", "bus", "tfl", "petrol", "fuel", "shell", "bp ", "parking"] },
  { category: "Housing", words: ["rent", "mortgage", "letting", "landlord"] },
  { category: "Utilities", words: ["energy", "electric", "gas", "water", "broadband", "internet", "mobile", "phone", "vodafone", "o2", "ee ", "three"] },
  { category: "Shopping", words: ["amazon", "ebay", "argos", "primark", "zara", "hm", "ikea", "paypal"] },
  { category: "Entertainment", words: ["netflix", "spotify", "disney", "youtube", "prime video", "cinema", "odeon", "steam", "xbox", "playstation"] },
  { category: "Health", words: ["pharmacy", "boots", "dentist", "doctor", "gym", "puregym", "fitness"] },
  { category: "Fees", words: ["fee", "charge", "interest", "overdraft"] },
];
const subscriptionWords = ["subscription", "membership", "netflix", "spotify", "disney", "apple", "google", "microsoft", "adobe", "youtube", "prime", "gym", "canva", "notion", "dropbox", "icloud"];
const salaryWords = ["salary", "wage", "payroll", "paye", "payslip", "employer"];
const nonSubscriptionWords = ["salary", "wage", "payroll", "paye", "payslip", "employer", "hmrc", "dwp", "universal credit", "student finance", "refund", "transfer", "the range"];

const frequencyLabels = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};
