import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  pickup: { type: String, required: true },
  drop: { type: String },
  pinCode: { type: String },
  pickupDate: { type: String, required: true },
  rideEnd: { type: String },
  pickupTime: { type: String, required: true },
  returnDate: { type: String },
  ridefare: { type: String, required: true },
  advancePayment: { type: String, default: "0" },
  orderType: { type: String, required: true },
  distance: { type: String },
  bookingStatus: {
    type: String,
    enum: ["pending", "booked", "cancelled"],
    default: "pending"
  },
  acknowledgement: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  }],
  nightAllowence: { type: String },
  extraHr: { type: String },
  extraKm: { type: String },
  waitingCharge: { type: String },
  bookingId: { type: String },
  carType: { type: String, required: true },
  vehicleType : {type : String , default : "Car 4 Seater"},
  wayType : {type : String , default : "One Way"},
  pilotAllocationStatus : {type : String, default : "Pending"},
  coupon : {type : String},
  packages: { type: String },
  dueAmount: { type: String },
  companyShare : { type: String },
  driverShare : {type : String},
  paymentMethod : {type : String, default : "Cash"},
  paymentStatus : {type : String},
  zeroCommisionBooking : {type : Boolean, default: false},
  otpVerificationStatus : {type : Boolean , default : false},
  tollCharges : {type : String,default : "Exclued"},
  advancePaymentConfirmation: { type: Boolean, default: false },
  paymentCollectionTime : {type : String},
  rideStartTime : {type : String},
  rideEndTime : {type : String},
  rideStatus : {type: String},
  bookingFrom : {type : String,default : "Website"},
  luggage: { type: String, default: "0" },
  carModel: { type: String, default: "0" },
  petAllowance: { type: String, default: "0" },
  refundable: { type: String, default: "0" },
  chauffeurs: { type: String, default: "0" },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MyDriver",
  },
  soloDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
  },
  fleet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VendorCars",
  },
  cancelReason: {
    type: String
  },
  vendorReason: {
    type: String
  },
  rideOtp: {
    type: String
  },
  rideStatus: {
    type: String, enum: ["not-started", "running", "completed"], default: "not-started"
  },
  verifyOtpTime: {
    type: String
  },
  customerReviewd: {
    type: Boolean,
    default: false
  },
  broadcastStatus: {
    type: String
  },
  isAdmin : {
    type : Boolean,
    default : false
  },
  selectedDrivers :  [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  }]
}, { timestamps: true });

OrderSchema.pre('save', function (next) {
  // Convert ridefare and advancePayment to numbers
  const ridefare = parseFloat(this.ridefare) || 0;
  const advancePayment = parseFloat(this.advancePayment) || 0;

  // Calculate due amount
  const dueAmount = (ridefare - advancePayment).toString();

  // Set the dueAmount field
  this.dueAmount = dueAmount;

  next();
});


// Generate bookingId before saving
OrderSchema.pre('save', function (next) {
  if (!this.bookingId) {
    const digits = Math.floor(100000 + Math.random() * 900000).toString(); // ensures 6 digit number
    const alphabets = generateRandomAlphabets(2);
    this.bookingId = digits + alphabets;
  }
  next();
});

function generateRandomAlphabets(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}


// Static method to check and expire orders
OrderSchema.statics.checkAndExpireOrders = async function () {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];

  await this.updateMany(
    {
      bookingStatus: "pending",
      pickupDate: { $lt: today }
    },
    {
      $set: { bookingStatus: "cancelled" }
    }
  );
};

// Add a post-find hook to ensure we always check for expired orders
OrderSchema.pre('find', async function () {
  await this.model.checkAndExpireOrders();
});

OrderSchema.pre('findOne', async function () {
  await this.model.checkAndExpireOrders();
});

const Order = mongoose.model("Order", OrderSchema);

export default Order;