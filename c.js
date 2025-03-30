class StrMath{
  #afterInit = false;
  #defaultBase = null;
  constructor(base){
    this.defaultBase = base;
    this.#afterInit = true;
  }
  set defaultBase(newBase){
    if(newBase instanceof StrMath.StrBase){
      if(this.#afterInit){
        console.log("new StrNum's of this StrMath instance ", this, ",");
        console.log("will no longer reflect the previous defaultBase,", this.defaultBase, ",");
        console.log("and will now be in the newly set defaultBase,", newBase, ",");
      }
      this.#defaultBase = newBase;
      this.StrNum = class StrNum extends StrMath.StrNum {
        constructor(value, etc = {frac: 0,sign:1}){super(newBase, value, etc)}
      };
    }else{
      throw new StrMath.StrBase.StrBaseInvalidError("it isn't a StrBase object!");
    }
  }
  get defaultBase(){
    return this.#defaultBase;
  }
  static StrNum = class StrNum{
    #value = null;
    #base = null;
    #frac = null;
    #sign = null;
    #endianness = null;
    #leadingZeroes = null;
    #trailingZeroes = null;
    #fracDelimiter = null;
    constructor(base, value, etc = {frac:0,sign:1}){//positive integer in big endian
      /**********   etc   **********\
        {frac: 4 }:       whole digits     12345.6789  4 fractional digits
        {frac: -3}:   3 fractional digits  987.654321     whole digits    
        sign indicates endianness,
            negative is little, positive is big
        absolute number indicates fractional digits.
            if there are no fractional digits, -0 is still !== 0
                in such a case where endianness still needs to be distinguished
                    by checking Math.sign(1/0) or Math.sign(1/-0)
        {sign: -1 | 1}: indicates sign of the number
      */
      if(base instanceof StrMath.StrBase){
        this.#base = base;
      }else{
        throw new StrMath.StrBase.StrBaseInvalidError("it isn't a StrBase object!");
      }
      if(!(value instanceof Array)){
        if(typeof(value) !== "string"){
          throw new TypeError("Value must be an array whose elements are contained in the base!");
        }
        value = [...value];
      }
      const validation = base.validateNum(value);
      if(!validation[0]){
        throw TypeError(validation[1]);
      }
      if(!(  
        (typeof(etc) == "object") &&
        ("sign" in etc) && ("frac" in etc)
      )){
        throw new TypeError(`etc must be an object with keys "sign" and "frac"!`);
      }
      if(!([-1,1].includes(etc.sign))){
        if(etc.sign !== 0){
          throw new TypeError(`Invalid sign: "${etc.sign}"!`);
        }else{
          const valueSet = (new Set(value));
          if((valueSet.size === 1) && valueSet.has(base.at(0)) ) throw new TypeError(`Zero sign (etc = {sign:0, ...}) was used incorrectly. The number must consist of only zeroes`);
        }
      }

      this.endianness = Math.sign(1/etc.frac);//only affects view, so allow somewhat free modification
      this.#frac = Math.abs(etc.frac);
      // "123" if frac is 3, equivalent to ".123"; if frac is 4, equivalent to ".X123", and missing number
      if(this.#frac > value.length) throw new TypeError(`Fractional portion is out of range of the value`);
      this.#sign = etc.sign;
      if(this.endianness === 1){// if big endian convert to little by reversing
        value = value.reverse();
      }
      this.#value = value;
      // now checking for leading and trailing zeroes
        value = [...value];
        this.fracDelimiter = Symbol("fracDelimiter");
        value.splice(this.#frac,0,fracDelimiter);
        value = [base.at(0), ...value, base.at(0)];
        // count leading zeroes
          var lead = 0; //
          for(const elem of value){
            if(elem === base.at(0)){//if elem is a zero, lead++, if not (or if elem is fracDelimiter, break)
              lead++;
            }else{
              lead--;//remove extra zero I added 8 lines ago
              break;
            }
          }
          this.#leadingZeroes = lead;
        value = value.reverse();
        // count trailing zeroes
          var trail = 0; //
          for(const elem of value){
            if(elem === base.at(0)){//if elem is a zero, trail++, if not (or if elem is fracDelimiter, break)
              trail++;
            }else{
              trail--;//remove extra zero I added 18 lines ago
              break;
            }
          }
          this.#trailingZeroes = trail;
      //change fracDelimiter if possible
        //if user defines fracDelimiter, use. fracDelimiter setter will verify it
          if("fracDelimiter" in etc){
            this.fracDelimiter = etc.fracDelimiter;
          }
        //if safeForString and decimal is usable, use it
          if(base.safeForString && (base.find(".") === -1)){
            this.fracDelimiter = ".";
          }
      
    }
    set endianness(value){
      if(!([-1,1].includes(value))) throw TypeError("Endianness must be either little (-1) or big (1)!");
      this.#endianness = value;
    }
    get endianness(){ return this.#endianness; }
    set value(unused){StrMath.permanentValueError("value")}
    get value(){ return this.#value; }
    set frac(unused){StrMath.permanentValueError("frac")}
    get frac(){ return this.#frac; }
    set sign(unused){StrMath.permanentValueError("sign")}
    get sign(){ return this.#sign; }
    set base(unused){StrMath.permanentValueError("base")}
    get base(){ return this.#base; }
    set presentation(unused){StrMath.permanentValueError("presentation")}
    get presentation(){
      var result = [...this.value];
      if(this.frac){//we already determined it isn't out of range, and now we're checking if it's not zero
        result.splice(this.frac, 0, this.fracDelimiter);
      }
      if(this.endianness === 1){//if meant to display as big endian, convert little endian used for processing to big endian
        result = result.reverse();
      }
      if(this.base.safeForString && (typeof(fracDelimiter) === "string")){
        //show as string if all items in base are single character strings, 
          //and fracDelimiter is a string because the caller chose it to be
            //or fracDelimiter is a "." because the user didn't choose any,
              //and "." happened not to be a part of the base.
        return result.join("");
      }else{
        return result;
      }
    }
    set wholeDigits(unused){StrMath.permanentValueError("wholeDigits")}
    get wholeDigits(){ return this.value.length - this.frac; }
    set leadingZeroes(unused){StrMath.permanentValueError("leadingZeroes")}
    get leadingZeroes(){ return this.#leadingZeroes; }
    set trailingZeroes(unused){StrMath.permanentValueError("trailingZeroes")}
    get trailingZeroes(){ return this.#trailingZeroes; }
    set fracDelimiter(value){
      if(this.base.find(value) + 1){ // (-1 + 1) = 0, falsey, (0... + 1) = truthy
        throw new TypeError("It's unsafe for the fractional delimiter (decimal point) to be part of the base!");
      }else{
        this.#fracDelimiter = value;
      }
    }
    get fracDelimiter(){ return this.#fracDelimiter; }
    toString(){
      return this.presentation.toString();
    }

  }
  static StrBase = class StrBase{
    #addTable = {};
    #subTable = {};
    #mulTable = {};
    #divTable = {};
    #safeForString = null;
    #base = null;
    constructor(...base){
      this.#base = base;
      const validation = this.constructor.validateBase(base);
      if(!validation[0]){
        throw new this.constructor.StrBaseInvalidError(validation[1])
      }
      this.#safeForString = validation[1];
      this.#genTables();
    }

    set safeForString(unused){StrMath.permanentValueError("safeForString")}
    get safeForString(){
      return this.#safeForString;
    }
    at(elemInd){
      return this.#base[elemInd];
    }
    find(elem){
      return this.#base.indexOf(elem);
    }
    len(){
      return this.#base.length;
    }
    validateNum(num){
      if(!num.length) return [false, `What is this? NOTHING! No digits, no service. num.length = 0`]
      for(const elemInd in num){
        if(!this.#base.includes(num[elemInd])) return [false, `What is this? I don't recognize that digit at element ${elemInd+1} of this number!`];
      }
      return [true, this];
    }
    static StrBaseInvalidError = class StrBaseInvalidError extends TypeError{  constructor(msg){super("One of the bases given is invalid because "+msg)}; name = "StrBaseInvalidError"  }
    static validateBase(base){//check that a base is valid, that all characters are unique, and dont include"+", "-", or "."
      var includesNonStrings = false;
      if(base.length < 2){
        return [false, `you must have at least two different elements to form a valid base! You have ${base.length?"only ONE":"ZERO"}!`];
      }
      var elemStringify = {
        undefined(){return `undefined`},
        boolean(tf){return `boolean(${tf})`},
        string(str){return `string("${str.replaceAll('\\','\\\\').replaceAll('"','\\"')}")`},
        symbol(sym){return `symbol(${sym})`},
        object(obj){return `object(${obj})`},
        number(num){return `number(${num})`},
        bigint(int){return `bigint(${int})`}
      }
      for(const elemInd in base){
        const elem = base[elemInd];/*SIGILL when debugging and stepping here? Why!!!!!!! happens every time!
        debugger; new StrMath.StrBase(..."0123456789");
        */
        includesNonStrings = includesNonStrings || (typeof(elem)!=="string") || (elem.length !== 1);
        // if already true, no need to evaluate further   |||||||||||                      ||||||
        //            if false, check if elem is not a string. if false and it is a string ||||||
        //                                                                   check if string length is 1. if it is, be false
        var strElem = elemStringify[typeof(elem)](elem);
        
        function pos(){return strElem+` at element ${parseInt(elemInd)+1} of the base is`}
        const dupeElemInd = base.lastIndexOf(elem);
        if(dupeElemInd !== parseInt(elemInd)){
          return [false, pos()+` REPEATED at element ${dupeElemInd + 1}`];
        }
      }
      return [true, !includesNonStrings];//[true, true] if all strings and all are 1 char in length
    }
    static convert(input, baseTo){
      if(!(input instanceof StrMath.StrNum)) throw new TypeError(`input was expected to be of type StrNum but got ${input.constructor} instead`);
      if(!(baseFrom instanceof StrMath.StrBase)) throw new StrMath.StrBase.StrBaseInvalidError("it isn't a StrBase object!");
      
    }
    #genTables(){
      const base = this.#base;
      //addTable
        for(const addend1Ind in base){
          const addend1 = base[addend1Ind];
          for(const addend2Ind in base){
            const addend2 = base[addend2Ind];
            const key = addend1+"+"+addend2;
            const hiddenSum = parseInt(addend1Ind)+parseInt(addend2Ind);
            if(hiddenSum >= base.length){ //9+2 >= 10, 
              addTable[key] = [base[hiddenSum - base.length], true]; //We need to carry a "one"
            }else{
              addTable[key] = [base[hiddenSum], false]; //We don't need to carry
            }
          }
        }
      //subTable
        for (const minuendInd in base) {
          const minuend = base[minuendInd];
          for (const subtrahendInd in base) {
            const subtrahend = base[subtrahendInd];
            const key = minuend + "-" + subtrahend;
            const hiddenDifference = parseInt(minuendInd) - parseInt(subtrahendInd);
            if (hiddenDifference < 0) {
              subTable[key] = [base[hiddenDifference + base.length], true]; //We need to borrow a "one"
            } else {
              subTable[key] = [base[hiddenDifference], false]; //We don't need to borrow
            }
          }
        }
      return table;
    }
    
  }
  static permanentValueError(param){
    param = new TypeError(`Parameter "${param}" is permanent. It may not be modified.`);
    param.name = "PermanentValueError";
    throw param;
  }
}
