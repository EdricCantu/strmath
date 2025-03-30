//normalized just means little endian respective to the base.

function _arg(ind){return "Argument "+(ind+2)}
function _val(ind){return arg(ind)+" aka Addend "+(ind+1)}
function _cv(charInd,numInd, charVal,numVal){return `Index ${ind} aka Character ${ind+1} of ${_val(numInd)}: "${charVal}" of "${numVal}"`}
function add(base, ...nums){
  //verification and normalization
    //verification: check base
      //check if base exists
        if(!base) throw new Error(`Wheres Argument 1, the Base?`)
      //check if base is correct type, string.
        if(typeof(base) !== "string") throw new Error(`Wrong type, all arguments should be string, including ${_arg(-1)}, the Base!`);
      //check if base is > 1 character
        if(base.length < 2) throw new Error(`${_arg(-1)}, the Base, should have at least 2 characters!`);
      //check if all characters are unique
        //to be implemented
    if(nums.length === 0) throw new Error("I can't add NOTHING! put more than 1 argument!");
    //verify and normalize addends
      var mostBefore = 0; //how many digits are whole
      var mostAfter = 0; //how many digits are fractional
      var nonIntegers = 0; //how many of nums are nonIntegers
      nums = nums.map((num, numInd)=>{
        if(typeof(num) !== "string") throw new Error(`Wrong type! All arguments should be string, including ${_arg(numInd)}, an Addend!`); //check if num is the correct type, string.
        if(!num.length) throw new Error(`What is this? NOTHING! ${_val(numInd)} == ""`); //check if num is an empty string
        if(num === ".") throw new Error(`... ${_val(numInd)} == "."`); //check if num is just a decimal point
        //verification iterate through characters of num to check if they are included in 
          var decimalPoints = 0; for(const charInd in num){
            const char = num[charInd];//
            if(char === "."){
              if(++decimalPoints > 1) throw new Error(`What is this? I don't think numbers should have more than one decimal point! ${_cv(charInd,numInd,char,num)}`);
              nonIntegers++;
              continue;
            }
            if(!base.includes(char)) throw new Error(`What is this? I don't recognize that digit at ${_chr(charInd)} of ${_val(numInd)}: "${char} of ${num}"`);
          }
        //Normalization: Add decimal to end of integer if no decimal found.
          if(!decimalPoints){
            decimalPoints++;
            num += ".";
          }
        //normalization: remove extraneous leading and trailing "zeroes"
          //which could influence mostBefore and mostAfter
          num[0].replaceAll(base[0], " ");
          num[0].trim();
          num[0].replaceAll(" ", base[0]);
        //normalization: add back in lone trailing and/or leading zero,
          //if one side of the decimal or both used to have only "zeroes"`
            //which the snippet titled
              // `  normalization: prevent extraneous leading and trailing "zeroes"  `
            //removed,
          //or if the original input was .XXX (aka 0.XXX) or XXX. (aka XXX.0)
          if(num[0] === ".") num = base[0] + num;//prevent leading decimal
          if(num[num.length-1] === ".") num += base[0];//prevent trailing decimal
        // normalization: separate sides of decimal
          num = num.split(".");
          mostBefore = Math.max(mostBefore, num[0].length);
          mostAfter = Math.max(mostAfter, num[1].length);
          return num;
      });
    //normalization: pad sides of decimal with zero to have everything the same length
      nums = nums.map((num)=>{
        num[0] = num[0].padStart(mostBefore, base[0]);
        num[1] = num[1].padEnd(mostAfter, base[1]);
        return num;
      })
    //normalization: finalize
      //mark decimal place count,
        const decimalPlaces = nums[0][1].length //get first element, right side of decimal
      //blindly join all places and reverse
        nums = nums.map((num)=>(   (num[0] + num[1]).split("").reverse().join("")   ))
  var sum = addNorm(base, ...nums);
  //unnormalize sum
    sum = sum.split("");
    sum.splice(decimalPlaces, 0, "."); //add decimal point back in
    sum = sum.reverse().join("");
    //remove leading and trailing zeroes
      sum.replaceAll(base[0], " ");
      sum.trim(); //if addNorm was done right, there should be no leading zeroes.
      sum.replaceAll(" ", base[0]);
  if(!nonIntegers){//if all of nums are integers
    return sum.slice(0,-2);
  }
  return sum; //return unnormalized sum
}
function genAdditionTable(base){  
  var table = {};
  for(const addend1Ind in base){
    const addend1 = base[addend1Ind];
    for(const addend2Ind in base){
      const addend2 = base[addend2Ind];
      const key = addend1+"+"+addend2;
      const hiddenSum = parseInt(addend1Ind)+parseInt(addend2Ind);
      if(hiddenSum >= base.length){ //9+2 >= 10
        table[key] = [base[hiddenSum - base.length], base[1]];  // table["9+2"] = [11 - 10, 1] = [1,1]
      }else{
        table[key] = [base[hiddenSum]];
      }
    }
  }
  return table;
}
function addNorm(base, ...ints){
  var result = Array(ints[0].length).fill(base[0]); //initialize result with 0, normalized
  const additionTable = genAdditionTable(base);
  function carryTheOne(index){
    if(index === result.length){//index 3 needed but doesn't exist, index 3 = length 3. Result currently looks like (b10) "999" =, or (b16) "FFF", and needs to add 1 more to make "0001" (LE)
      result.push(base[0]);//turn (b10) "999" or (b16) "FFF" into (LE) "9990" or "FFF0" so there's enough digits to use to make "0001"
    }
    const smallResult = additionTable[base[1]+"+"+result[index]];
    result[index] = smallResult[0]; // add ones place
    if(smallResult.length > 1){ //we need to carry the "one"
      carryTheOne(parseInt(index)+1);
    }
  }
  for(const intInd in ints){//iterate integer by integer
    const int = ints[intInd];
    for(const digitInd in int){//iterate digit by digit
      const digit = int[digitInd];
      const smallResult = additionTable[digit+"+"+result[digitInd]]
      result[digitInd] = smallResult[0]; // add ones place
      if(smallResult.length > 1){ //we need to carry the "one"
        carryTheOne(parseInt(digitInd)+1);
      }
    }
  }
  return result.join("");
}

function genSubtractionTable(base) {
  var table = {};
  for (const minuendInd in base) {
    const minuend = base[minuendInd];
    for (const subtrahendInd in base) {
      const subtrahend = base[subtrahendInd];
      const key = minuend + "-" + subtrahend;
      const hiddenDifference = parseInt(minuendInd) - parseInt(subtrahendInd);
      if (hiddenDifference < 0) {
        table[key] = [base[hiddenDifference + base.length], base[1]]; // Borrow needed
      } else {
        table[key] = [base[hiddenDifference]]; // No borrow
      }
    }
  }
  return table;
}

function subNorm(base, ...ints) {
  var result = ints.shift().split("");//setting as zero won't work out
  var resultBuffer = result;
  const subtractionTable = genSubtractionTable(base);
  
  function borrowOne(index) {
    if (index === result.length) {//index 3 needed but doesn't exist, index 3 = length 3. Code wants to borrow a "ten" it doesn't have. 
      console.log("Result is negative. Resetting resultBuffer and swapping current minuend and subtrahend to obtain negative value.");
      throw "swap";
    }
    const smallResult = subtractionTable[resultBuffer[index] + "-" + base[1]];
    resultBuffer[index] = smallResult[0];
    if (smallResult.length > 1) {
      borrowOne(parseInt(index) + 1);
    }
  }

  for (const intInd in ints) {
    const int = ints[intInd];
    digits: for (let digitInd in int) {
      const digit = int[digitInd];
      const smallResult = subtractionTable[resultBuffer[digitInd] + "-" + digit];
      resultBuffer[digitInd] = smallResult[0]; // Subtract ones place
      if (smallResult.length > 1) { // Borrow required
        try{
          borrowOne(parseInt(digitInd) + 1);
        }catch(e){
          if(e === "swap"){
            //                         get negative,        and if more, add them since: sub(neg(x), y) = neg(add(x y))
            result = addNorm(base, subNorm(base, int, result.join("")), ...ints.slice(intInd+1));
            
            return "-"+result;
          }else{
            throw e;
          }
        }
      }
      result = resultBuffer;
    }
  }
  return result.join("");
}
