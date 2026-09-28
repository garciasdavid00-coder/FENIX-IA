const router=require('express').Router();
const rateLimit=require('express-rate-limit');
const {extractFile}=require('../services/fileExtractor');
let active=0;
router.post('/api/archivos/texto',rateLimit({windowMs:60000,limit:6,standardHeaders:true,legacyHeaders:false}),async(req,res)=>{
 const {base64,extension}=req.body||{};
 if(!['pdf','docx'].includes(extension)||typeof base64!=='string'||base64.length>4000000||!/^[A-Za-z0-9+/=]+$/.test(base64))return res.status(400).json({error:'Archivo inválido o mayor de 3 MB.'});
 if(active>=2)return res.status(429).json({error:'Hay documentos en proceso. Intenta de nuevo.'});
 active++;
 try{const text=await extractFile(Buffer.from(base64,'base64'),extension);if(!text.trim())return res.status(422).json({error:'No se encontró texto. Los documentos escaneados necesitan OCR.'});res.json({text})}
 catch(e){res.status(422).json({error:e.message})}finally{active--}
});
module.exports=router;
