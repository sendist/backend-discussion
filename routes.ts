import express from "express";
const router = express.Router();
// untuk masing-masing fitur, buat folder sesuai fitur pada folder "src", misal "forumdiskusi"
// dapat melakukan copy file index.ts dari testroute sebagai template awal pembuatan route API
// setelah membuat route, masukkan import di sini.
// Mohon samakan format penamaan default import dengan menambahkan "Route" pada akhir nama, misal:
// import forumdiskusiRoute from "./forumdiskusi";
import discussionRoute from "./discussion";


// untuk masing-masing fitur, tambahkan route di sini. contoh:
// router.use("/forumdiskusi", forumdiskusiRoute);
router.use('/discussion', discussionRoute);


export default router;