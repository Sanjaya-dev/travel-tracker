import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "tes",
  password: "admin",
  port: 5432,
});

db.connect();

// db.query("SELECT * FROM visited_countries",(err,res) => {
//   if (err) {
//     console.error("Error executing query",err.stack);
//   } else {

//   }
// })

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisitedCountries(){
  const result = await db.query("SELECT country_code FROM visited_countries");
  const countrycode = [];
  result.rows.forEach((code) => {
    countrycode.push(code.country_code);
  });
  return countrycode;
}

var errorMsg = "";
app.get("/", async (req, res) => {
  //Write your code here.
  const countryCode = await checkVisitedCountries();
  // console.log(typeof(countrycode));
  res.render("index.ejs", {
    countries: countryCode,
    total: countryCode.length,
    error: errorMsg
  });

  // db.end();
});

app.post("/add", async (req, res) => {
  try {
    const addCountryName = req.body.country;
    const resultCtyCode = await db.query(
      `SELECT country_code FROM countries WHERE lower(country_name) LIKE '%${addCountryName.toLowerCase()}%'`
    );
    console.log(resultCtyCode.rowCount);
    //if (resultCtyCode.rowCount != 0) {
    //   const addCountryCode = resultCtyCode.rows[0].country_code;
    //   const visitedCountries = await checkVisitedCountries();
    //   const findCountryCode = visitedCountries.find((country)=> country == addCountryCode);
    //   // console.log(findCountryCode);
    //   if (addCountryCode != findCountryCode) {
    //     // await db.query("INSERT INTO visited_countries(country_code) VALUES ($1)", [
    //     //   addCountryCode,
    //     // ]);
    //     console.log("berhasil menambahkan");
    //     res.redirect("/");
    //   } else {
    //     console.log("gagal menambahkan data");
    //   }
    
    // //   // console.log(addCountryCode);
      
    // //   // res.redirect("/"); 
      
    //}
    const addCountryCode = resultCtyCode.rows[0].country_code;
    try {
      await db.query("INSERT INTO visited_countries(country_code) VALUES ($1)", [
        addCountryCode,
      ]);
      console.log("berhasil menambahkan");
      res.redirect("/");
    } catch (error) {
      errorMsg = "Country has already been added, try again";
      res.redirect("/");
    }
  } catch (error) {
    errorMsg = "Country does not exist, try again";
    res.redirect("/");
  }

  //   // db.end();
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
