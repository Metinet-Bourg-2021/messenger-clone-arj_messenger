async function generateId(model){

    try{
        result = await model.find({}).sort({id:-1});
        if(result.length > 0) return result[0].id+1
        else return 1
    }catch(err){
        console.log(err)
    }

}
module.exports = {generateId:generateId};