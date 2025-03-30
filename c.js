class StrMath{
  #afterInit = false;
  #defaultBase = null;
  constructor(base){
    this.defaultBase = base;
    this.#afterInit = true;
    this.StrNum = class StrNum extends StrMath.StrNum {
      constructor(value, etc = {frac: 0,sign:1}) {super(base, value, etc)}
    };
  }
  set defaultBase(value){
    if(value instanceof StrMath.StrBase){
      if(this.#afterInit){
        console.log("new StrNum's of this StrMath instance ", this, ",");
        console.log("will no longer reflect the previous defaultBase,", defaultBase, ",");
        console.log("and will now be in the newly set defaultBase,", value, ",");
      }
      this.#defaultBase = value;
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
      
    }
    get endianness(){
      return this.#endianness;
    }
    set endianness(value){
      if(!([-1,1].includes(value))) throw TypeError("Endianness must be either little (-1) or big (1)!");
      this.#endianness = value;
    }
    get value(){
      return this.#value;
    }
    get frac(){
      return this.#frac;
    }
    get sign(){
      return this.#sign;
    }
    get base(){
      return this.#base;
    }
    get presentation(){
      var result = [...this.value];
      if(this.frac){//we already determined it isn't out of range
        result.splice(this.frac, 0,".")
      }
      if(this.endianness === 1){//if meant to display as big endian, convert little endian used for processing to big endian
        result = result.reverse();
      }
      if(this.base.safeForString){//show as string if all items in base are single characters
        return result.join("");
      }else{
        return result;
      }
    }
    toString(){
      return this.string.toString();
    }
  }
  static StrBase = class StrBase{
    #safeForString = null;
    #base = null;
    constructor(...base){
      this.#base = base;
      const validation = this.constructor.validateBase(base);
      if(!validation[0]){
        throw new this.constructor.StrBaseInvalidError(validation[1])
      }
      this.#safeForString = validation[1];
    }
    
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
        //if(["+","-","."].includes(elem)){
          //return [false, pos()+` RESERVED for determining the ${(elem===".")?"fractional portion":"sign"} of a number!`]
        //}
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
    
  }
}
