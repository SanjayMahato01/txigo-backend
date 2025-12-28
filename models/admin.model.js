import mongoose from "mongoose"

const AdminSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    username : {
        type :  String,
        require : true
    },
    password : {
        type : String,
        required : true
    }
})

 const Admin = new mongoose.model("Admin", AdminSchema);

 export default Admin;