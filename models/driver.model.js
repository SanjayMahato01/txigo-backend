import mongoose from "mongoose"

const DriverSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    age: { type: String },
    state: { type: String },
    completedOrders : {type : mongoose.Schema.Types.ObjectId, ref:"Order"},
    walletBalance: {
        type: String,
        default: "0"
    },
    bank: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DriverBank"
    },
    pilotType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DriverPlan"
    },
    status: {
        type: String,
        enum: ["active", "block", "pending", "incomplete", "failed"],
        default: "incomplete"
    },
    gender: { type: String },
    email: { type: String },
    referCode: { type: String },
    dateOfBirth: { type: String },
    address: { type: String },
    pinCode: { type: String },
    vehicle: {
        rcNo: { type: String },
        registeredDate: { type: String },
        category: {
            type: String,
            enum: ["petrol", "diesel", "cng", "ev"]
        },
        carType: { type: String },
        city: { type: String },
        seat: {
            type: String,
        },
        rcImage: {
            front: { type: String },
            back: { type: String }
        },
        carImage: {
            front: { type: String },
            back: { type: String }
        }
    },
    documents: {
        dlNo: { type: String },
        dlImage: {
            front: { type: String },
            back: { type: String }
        },
        aadharNo: { type: String },
        aadharImage: {
            front: { type: String },
            back: { type: String }
        },
        panNo: { type: String },
        panImage: {
            front: { type: String },
            back: { type: String }
        }
    },
    verified: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    },
    verificationStage: {
        type: String,
        enum: ["pending", "submit", "completed"],
        default: "pending"
    },
    failerMessage: {
        type: String
    },
    failerSection: {
        type: String
    }
}, { timestamps: true });

const Driver = new mongoose.model("Driver", DriverSchema);

export default Driver;