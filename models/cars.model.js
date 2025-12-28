import mongoose from "mongoose"

const CarsSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
   price : {
    type : String,
    required : true
   }
});

 const Cars = new mongoose.model("Cars", CarsSchema);

 export default Cars;