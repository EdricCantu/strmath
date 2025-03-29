function _arg(ind){return "Argument "+(ind+2)}
function _val(ind){return arg(ind)+" aka Addend "+(ind+1)}
function _cv(charInd,numInd, charVal,numVal){return `Index ${ind} aka Character ${ind+1} of ${_val(numInd)}: "${charVal}" of "${numVal}"`}
function add(base, nums...){
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
          var decimals = 0; for(const charInd in num){
            const char = num[charInd];//
            if(char === "."){
              if(++decimals > 1) throw new Error(`What is this? I don't think numbers should have more than one decimal point! ${_cv(charInd,numInd,char,num)}`);
              nonIntegers++;
              continue;
            }
            if(!base.includes(char)) throw new Error(`What is this? I don't recognize that digit at ${_chr(charInd)} of ${_val(numInd)}: "${char} of ${num}"`);
          }
        //Normalization: Add decimal to end of integer if no decimal found.
          
          if(!decimals){
            decimals++;
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
              // "  normalization: prevent extraneous leading and trailing "zeroes"  "
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
  if(!nonIntegers){//if all of nums are integers, remove decimal, and calculate with BigInt
    return nums
      .reduce((acc,add)=>(acc+BigInt(num[0])), 0n)
      .toString();
  }else{//if there is at least noninteger in nums, continue with noninteger process
    //still part of verification and normalization
      //normalization: pad sides of decimal with zero to have everything the same length
        nums = nums.map((num)=>{
          num[0].padStart(mostBefore, base[0]);
          num[1].padEnd(mostAfter, base[1]);
          return num;
        })
      //normalization: finalize
        //mark decimal place count,
          const decimals = nums[0][1].length //get first element, right side of decimal
        //blindly join all places and reverse
          nums = nums.map((num)=>(   (num[0] + num[1]).split("").reverse().join("")   ))
    var sum = addNorm(nums);
    //unnormalize sum
      sum = sum.split("");
      sum.splice(decimals, 0, "."); //add decimal point back in
      sum = sum.reverse().join("");
      //remove leading and trailing zeroes
        sum.replaceAll(base[0], " ");
        num.trim();
        num.replaceAll(" ", base[0]);
    return sum; //return unnormalized sum
  }
}
function addNorm(...nums){
  
}
