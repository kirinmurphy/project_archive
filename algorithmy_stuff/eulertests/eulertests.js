// http://www.javascripter.net/math/index.htm
// http://www.javascripter.net/faq/numberisprime.htm
// http://www.javascripter.net/math/primes/millerrabinprimalitytest.htm

String.prototype.reverse=function(){return this.split("").reverse().join("");}

Array.prototype.max = function( array ){
    return Math.max.apply( Math, array );
};

Array.prototype.min = function( array ){
    return Math.min.apply( Math, array );
};

var moreMath = {
  getArrayMax: function(array) {
    return Math.max.apply( Math, array );
  },
  checkPalindrome: function(num) {
    var num = num+''; //convert to string
    var reversed = (num).split("").reverse().join('');
    return ( num === reversed );
  },
  checkPrime: function(num) {
    if (isNaN(num) || !isFinite(num) || num%1 || num<2 ) return false;
    if (num == 2 || num ==3) return true;

    var m=Math.sqrt(num);
    for (var i=5;i<=m;i+=6) {
      if (num % i == 0 || num % (i+2) == 0) return false;
    }
    return true;
  },
  getNPrimes: function(n) {

    // start off with a few seed primes
    var primes = [ 2, 3, 5, 7, 11 ];

    // see if a possible prime is divisible by all previous primes
    var seeIfThisIsDivisibleByAllOfThese = function(value,dividers) {

      // for each possible factor, check to see if divided value has no remainder
      for ( var i=0; i < dividers.length; i++ ) {
        if ( value % dividers[i] === 0 ) { return true; }
      }
      return false;
    };

    // iterate from current number of seed primes to the Nth value passed into the function
    for ( var i = 5; i < n; i++ ) {

      // check for next possible prime starting with the next odd number after the last prime
      var nextPossiblePrime = primes[primes.length-1] + 2;

      // test if nextPossiblePrime is divisible by one of the previous primes
      while ( seeIfThisIsDivisibleByAllOfThese(nextPossiblePrime,primes) === true ) {

        // if true (nextPossiblePrime is not a prime), go to next odd number and test again
        nextPossiblePrime += 2;
      };

      // if false, nextPossible prime is prime, add to array of existing primes
      primes.push(nextPossiblePrime);
    }
    return primes;
  },
  sumTheseLargeNumbers : function(numberSet) {

    // loop through all of the numbers to find the maxLength of the numberSet
    // later we will iterate through each digit until the maxLength is reached
    var maxDigits = 0;
    for ( var h = 0, len = numberSet.length; h < len; h++ ) {

      var length = numberSet[h].length + '';
      if ( length > maxDigits ) { maxDigits = length; }

      // reverse strings, so we start adding left to right in the string sequence
      numberSet[h] = numberSet[h].reverse();
    }

    var digitSums = [];  // sums for each digit in #s
    var carryOver = 0;   // amount to carry over to next digit

    // loop through each digit, last to first and add sums
    for ( var i = 0; i < maxDigits; i++ ) {
      var digitTotal = 0;

      // loop through the same digit/position in each array, adding all the values for that digit
      for ( var j = 0; j < numberSet.length; j++ ) {

        // for the current digit in each number, if no digit (number is over) pass in 0
        var thisDigitInThisArray = numberSet[j].slice(i, i+1 ) || 0;
        digitTotal += parseInt(thisDigitInThisArray);
      }

      // add carryOver from previous addition
      digitTotal += carryOver;

      // turn into a string so we can slice as an array
      digitTotal += '';

      // if digit total length is > 1, split digitSum and carryOver
      var digitLength = digitTotal.length;
      var digitSum = 0;
      if ( digitLength > 1 ) {
        carryOver = parseInt(digitTotal.slice(0,digitLength-1));
        digitSum = digitTotal.slice(digitLength-1);
      } else {
        carryOver = 0;
        digitSum = digitTotal;
      }

      // only add digitSum to digitSums array, carry over will be accessed on the next digit
      // or after the loop is over for the final carry over
      digitSums.push(digitSum);
    }

    // after we are done with adding sums, we put the final carry over value as the last(first) digit
    if ( carryOver > 0 ) { digitSums.push(carryOver); }

    // reverse the array and join the elements into a string
    // addition was done in reverse, so we switch it back
    // returning the full value as a string (too big to risk turning to #)
    return digitSums.reverse().join("");
  }

}

//  {
//    id:,
//    question:"",
//    fn: function() {
//
//    }
//  }

var eulerTests = {
  autoAnswerThese : [13],
  answers : [
    233168, 4613732, 6857, 906609, 232792560, 25164150, 104743, 40824, 31875000, 142913828922,
    70600674, 76576500, 5537376230, 837799, 137846528820, 1366, 21124, 1074, 171, 648
  ],
  questions : [
      {
        id:1,
        question:"If we list all the natural numbers below 10 that are multiples of 3 or 5, we get 3, 5, 6 and 9.<br/> The sum of these multiples is 23.  Find the sum of all the multiples of 3 or 5 below 1000.",
        fn: function(){
          var startVal = 1, maxVal = 999, nums = [];
          while ( startVal <= maxVal ) { nums.push(startVal); startVal++; }
          var sum = 0, divisibleNums = [];
          $.each(nums,function(index,item){
            if ( item % 3 === 0 || item % 5 === 0 ) { divisibleNums.push(item); sum += item; }
          });
          return sum;
        }
      },
      {
        id:2,
        question:"By considering the terms in the Fibonacci sequence whose values do not exceed four million, find the sum of the even-valued terms.",
        fn: function(){
          var fibnums = [1,2];
          var maxValue = 4000000;

          var len = fibnums.length
          while ( fibnums[len-1] < maxValue ) {
              fibnums.push(fibnums[len-1]+fibnums[len-2]);
              len = fibnums.length;
          };
          // fibnums pushes one value that is over maxValue
          // no way to determine which value will exceed maxValue until it is exceeded
          // remove the last exceeded value with .pop()
          fibnums.pop();

          var sum = 0;
          for ( var i = 0; i < fibnums.length; i++ ) {
              if ( fibnums[i] < maxValue && fibnums[i] % 2 === 0 ) {  sum += fibnums[i]  }
          }
          //console.log(fibnums + ' = ' + sum);

          return sum;
        }
      },
      {
        id:3,
        question:"The prime factors of 13195 are 5, 7, 13 and 29.<br/> What is the largest prime factor of the number 600851475143 ? <br/> <strong>This might freeze your browser unless you're in Chrome</strong>",
        fn: function() {
          var number = 600851475143;
          //return 6857; //calculation is super slow, manually entered what was calculated

          if ( number === 4 ) return 2;

          for ( var i=2, len=number/2; i<len; i++ ) {
            if ( moreMath.checkPrime(number/i) === true ) {
              return number/i;
            }
          }
        }
      },
      {
        id:4,
        question:"A palindromic number reads the same both ways. The largest palindrome made from the product of two 2-digit numbers is 9009 = 91 × 99.<br/>Find the largest palindrome made from the product of two 3-digit numbers.",
        fn: function() {

          var minMultiplier = 100;
          var maxMultiplier = 999;
          var maxPossibleVal = Math.pow(maxMultiplier,2);
          var minPossibleVal = Math.pow(minMultiplier,2);

          // start at maxPossible value and decrement for each possible palindrome
          for ( var i = maxPossibleVal; i > minPossibleVal; i-- ) {

            // check if palindrome and if not prime ( if prime, not divisible so don't check )
            if ( moreMath.checkPalindrome(i) === true && moreMath.checkPrime(i) === false ) {

              // for each possible palindrome, start at top possible multiplier and decrement for each multiplier
              for ( var j = maxMultiplier; j > minMultiplier; j-- ) {

                // if palindrome divided by the multiplier has no remainder
                // and is between min/max multiplier, it's our #!
                if ( i % j === 0 &&  ( i / j ) >= minMultiplier && ( i / j ) <= maxMultiplier ) {
                  return i;
                }
              }

            }
          }
        }
      },
      {
        id:5,
        question:"2520 is the smallest number that can be divided by each of the numbers from 1 to 10 without any remainder.<br/> What is the smallest positive number that is evenly divisible by all of the numbers from 1 to 20?",
        fn: function() {

          // findProduct relies on explicit iteration through all possibilities,
          // are there patterns to determine which iterations will be known to fail?
          var findProduct = function( maxFactor ) {
            for ( var n = maxFactor; ; n += maxFactor ) {
              for ( var i = 2; i <= maxFactor; i++ ) {
                if ( n % i > 0 ) { break; }
                else if ( i === maxFactor ) { return n; }
              }
            }
          }
          return findProduct(20);
        }
      },
      {
        id:6,
          question:"The sum of the squares of the first ten natural numbers is - 1^2 + 2^2 + ... + 10^2 = 385<br/>The square of the sum of the first ten natural numbers is - (1 + 2 + ... + 10)^2 = 55^2 = 3025.<br/>  Hence the difference between the sum of the squares of the first ten natural numbers and the square of the sum is 3025 - 385 = 2640.<br/>  Find the difference between the sum of the squares of the first one hundred natural numbers and the square of the sum.",
        fn: function() {
          var getSquaredSums = function(maxNum){
            var squaredSum = 0;
            var sum = 0;
            for ( var i = 1; i<=maxNum; i++ ) {
              squaredSum += i*i;
              sum += i;
            }
            return Math.abs( squaredSum - (sum*sum) );
          }
          return getSquaredSums(100);
        }
      },
      {
        id:7,
        question:"By listing the first six prime numbers: 2, 3, 5, 7, 11, and 13, we can see that the 6th prime is 13.<br/>What is the 10001st prime number?",
        links: [
          { 'label':'Unfolding',
            'url':'http://blog.functionalfun.net/2008/04/project-euler-problem-7-and-10.html' }
        ],
        fn: function() {
          // call getNPrimes and return last value in the sequence
          var primes = moreMath.getNPrimes(10001);
          return primes[primes.length-1];
        }
      },
      {
        id:8,
        question:"Find the greatest product of five consecutive digits in the 1000-digit number.<br/>7316717653133062491922511967442657474235534919493496983520312774506326239578318016984801869478851843<br/>8586156078911294949545950173795833195285320880551112540698747158523863050715693290963295227443043557<br/>6689664895044524452316173185640309871112172238311362229893423380308135336276614282806444486645238749<br/>3035890729629049156044077239071381051585930796086670172427121883998797908792274921901699720888093776<br/>6572733300105336788122023542180975125454059475224352584907711670556013604839586446706324415722155397<br/>5369781797784617406495514929086256932197846862248283972241375657056057490261407972968652414535100474<br/>8216637048440319989000889524345065854122758866688116427171479924442928230863465674813919123162824586<br/>1786645835912456652947654568284891288314260769004224219022671055626321111109370544217506941658960408<br/>0719840385096245544436298123098787992724428490918884580156166097919133875499200524063689912560717606<br/>0588611646710940507754100225698315520005593572972571636269561882670428252483600823257530420752963450",
        fn: function() {
          var greatestProductOfConsecutiveDigits = function(digits,number){

            var highestVal = 0;
            for ( var i=0, len = number.length; i<(len-(digits-1)); i++) {

              var slicedNumber = number.substring(i,i+digits);
              var firstChar = slicedNumber[0];
              var lastChar = slicedNumber[digits-1];

              // if slicedNumber has 0, product will always be 0,
              // if 1 is first or last char, number will never be greater than it's next/prev numbers
              if ( slicedNumber.match('0') === null && firstChar !== '1' && lastChar !== '1' ) {

                // start with base multiplier of 1
                var calculatedNumber = 1;
                for ( var j=0, jlen = slicedNumber.length; j<jlen; j++ ) {
                  calculatedNumber *= parseInt(slicedNumber[j]);
                }
                highestVal = (calculatedNumber > highestVal) ? calculatedNumber : highestVal;
              }
            }
            return highestVal;
          }
return greatestProductOfConsecutiveDigits(5,"7316717653133062491922511967442657474235534919493496983520312774506326239578318016984801869478851843858615607891129494954595017379583319528532088055111254069874715852386305071569329096329522744304355766896648950445244523161731856403098711121722383113622298934233803081353362766142828064444866452387493035890729629049156044077239071381051585930796086670172427121883998797908792274921901699720888093776657273330010533678812202354218097512545405947522435258490771167055601360483958644670632441572215539753697817977846174064955149290862569321978468622482839722413756570560574902614079729686524145351004748216637048440319989000889524345065854122758866688116427171479924442928230863465674813919123162824586178664583591245665294765456828489128831426076900422421902267105562632111110937054421750694165896040807198403850962455444362981230987879927244284909188845801561660979191338754992005240636899125607176060588611646710940507754100225698315520005593572972571636269561882670428252483600823257530420752963450");
        }
      },
      {
        id:9,
        question:"A Pythagorean triplet is a set of three natural numbers, a  b  c, for which, a^2 + b^2 = c^2<br/>For example, 3^2 + 4^2 = 5^2 / 9 + 16 = 25.<br/>There exists exactly one Pythagorean triplet for which a + b + c = 1000. Find the product abc.",
        links: [
          { 'label':'Euclid\'s Formula', 'url':'http://www.theholtons.info/eric/post/2008/05/Project-Euler---Problem-Nine.aspx'  },
          { 'label':'Stack Overflow help', 'url':'http://stackoverflow.com/questions/2817848/find-pythagorean-triplet-for-which-a-b-c-1000' }
        ],
        fn: function() {
          var findPythagoreanTripletWhosProductEquals = function(total) {
            for ( var a = 1; a <= total/3; a++ ) {
              for ( var b = a+1; b <= total/2; b++ ) {
                var c = total - a - b;
                if ( c > 0 && a*a + b*b == c*c )  { return [a,b,c]; }
              }
            }
          }
          var triplet = findPythagoreanTripletWhosProductEquals(1000);
          return triplet[0] * triplet[1] * triplet[2];

        }
      },
      {
        id:13,
        question:"Work out the first ten digits of the sum of the following one-hundred 50-digit numbers.",
        links: [
          { 'label':'The Numbers',
            'url':'http://projecteuler.net/index.php?section=problems&id=13' }
        ],
        fn: function() {
          var theNumbers = [
            "37107287533902102798797998220837590246510135740250",
            "46376937677490009712648124896970078050417018260538",
            "74324986199524741059474233309513058123726617309629",
            "91942213363574161572522430563301811072406154908250",
            "23067588207539346171171980310421047513778063246676",
            "89261670696623633820136378418383684178734361726757",
            "28112879812849979408065481931592621691275889832738",
            "44274228917432520321923589422876796487670272189318",
            "47451445736001306439091167216856844588711603153276",
            "70386486105843025439939619828917593665686757934951",
            "62176457141856560629502157223196586755079324193331",
            "64906352462741904929101432445813822663347944758178",
            "92575867718337217661963751590579239728245598838407",
            "58203565325359399008402633568948830189458628227828",
            "80181199384826282014278194139940567587151170094390",
            "35398664372827112653829987240784473053190104293586",
            "86515506006295864861532075273371959191420517255829",
            "71693888707715466499115593487603532921714970056938",
            "54370070576826684624621495650076471787294438377604",
            "53282654108756828443191190634694037855217779295145",
            "36123272525000296071075082563815656710885258350721",
            "45876576172410976447339110607218265236877223636045",
            "17423706905851860660448207621209813287860733969412",
            "81142660418086830619328460811191061556940512689692",
            "51934325451728388641918047049293215058642563049483",
            "62467221648435076201727918039944693004732956340691",
            "15732444386908125794514089057706229429197107928209",
            "55037687525678773091862540744969844508330393682126",
            "18336384825330154686196124348767681297534375946515",
            "80386287592878490201521685554828717201219257766954",
            "78182833757993103614740356856449095527097864797581",
            "16726320100436897842553539920931837441497806860984",
            "48403098129077791799088218795327364475675590848030",
            "87086987551392711854517078544161852424320693150332",
            "59959406895756536782107074926966537676326235447210",
            "69793950679652694742597709739166693763042633987085",
            "41052684708299085211399427365734116182760315001271",
            "65378607361501080857009149939512557028198746004375",
            "35829035317434717326932123578154982629742552737307",
            "94953759765105305946966067683156574377167401875275",
            "88902802571733229619176668713819931811048770190271",
            "25267680276078003013678680992525463401061632866526",
            "36270218540497705585629946580636237993140746255962",
            "24074486908231174977792365466257246923322810917141",
            "91430288197103288597806669760892938638285025333403",
            "34413065578016127815921815005561868836468420090470",
            "23053081172816430487623791969842487255036638784583",
            "11487696932154902810424020138335124462181441773470",
            "63783299490636259666498587618221225225512486764533",
            "67720186971698544312419572409913959008952310058822",
            "95548255300263520781532296796249481641953868218774",
            "76085327132285723110424803456124867697064507995236",
            "37774242535411291684276865538926205024910326572967",
            "23701913275725675285653248258265463092207058596522",
            "29798860272258331913126375147341994889534765745501",
            "18495701454879288984856827726077713721403798879715",
            "38298203783031473527721580348144513491373226651381",
            "34829543829199918180278916522431027392251122869539",
            "40957953066405232632538044100059654939159879593635",
            "29746152185502371307642255121183693803580388584903",
            "41698116222072977186158236678424689157993532961922",
            "62467957194401269043877107275048102390895523597457",
            "23189706772547915061505504953922979530901129967519",
            "86188088225875314529584099251203829009407770775672",
            "11306739708304724483816533873502340845647058077308",
            "82959174767140363198008187129011875491310547126581",
            "97623331044818386269515456334926366572897563400500",
            "42846280183517070527831839425882145521227251250327",
            "55121603546981200581762165212827652751691296897789",
            "32238195734329339946437501907836945765883352399886",
            "75506164965184775180738168837861091527357929701337",
            "62177842752192623401942399639168044983993173312731",
            "32924185707147349566916674687634660915035914677504",
            "99518671430235219628894890102423325116913619626622",
            "73267460800591547471830798392868535206946944540724",
            "76841822524674417161514036427982273348055556214818",
            "97142617910342598647204516893989422179826088076852",
            "87783646182799346313767754307809363333018982642090",
            "10848802521674670883215120185883543223812876952786",
            "71329612474782464538636993009049310363619763878039",
            "62184073572399794223406235393808339651327408011116",
            "66627891981488087797941876876144230030984490851411",
            "60661826293682836764744779239180335110989069790714",
            "85786944089552990653640447425576083659976645795096",
            "66024396409905389607120198219976047599490197230297",
            "64913982680032973156037120041377903785566085089252",
            "16730939319872750275468906903707539413042652315011",
            "94809377245048795150954100921645863754710598436791",
            "78639167021187492431995700641917969777599028300699",
            "15368713711936614952811305876380278410754449733078",
            "40789923115535562561142322423255033685442488917353",
            "44889911501440648020369068063960672322193204149535",
            "41503128880339536053299340368006977710650566631954",
            "81234880673210146739058568557934581403627822703280",
            "82616570773948327592232845941706525094512325230608",
            "22918802058777319719839450180888072429661980811197",
            "77158542502016545090413245809786882778948721859617",
            "72107838435069186155435662884062257473692284509516",
            "20849603980134001723930671666823555245252804609722",
            "53503534226472524250874054075591789781264330331690"
          ];

          // get sum of the large number
          var total = moreMath.sumTheseLargeNumbers(theNumbers);

          // slice off the first 10 numbers and turn to #
          return parseInt(total.slice(0,10));
        }
      },
      {
        id:16,
        question:"2^15 = 32768 and the sum of its digits is 3 + 2 + 7 + 6 + 8 = 26.<br/>What is the sum of the digits of the number 2^1000?",
        links: [
          { 'label':'Calculating Large Powers of Two',
            'url':'http://blog.functionalfun.net/2008/07/project-euler-problem-16-calculating.html' },
          { 'label':'Stack Overflow Help',
            'url':'http://stackoverflow.com/questions/677579/project-euler-16-c-2-0' }
        ],
        fn: function() {
          var thisToThePowerOfThat = function(value,n) {

            // seed numbas
            var numberArray = [value];

            while( n > 1 ) {
              n--;
              // reassign with itself * 2
              numberArray = numberArray.concat(numberArray.slice(0));
            }
            var total = 0;
            for ( var i=0, len=numberArray.length; i < len; i++ ) {
              total += numberArray[i];
            }

            console.log(total);
            return total;
            //var totalNum = Math.pow(2,nthPower);
            //console.log(totalNum);
          }
          return thisToThePowerOfThat(2,15);
        }
      },
      {
        id:20,
        question:"Find the sum of digits in 100! (Factorial[100])",
        links:[
          { 'label':'Factorial Primer',
            'url':'http://www.mathsisfun.com/numbers/factorial.html' }
        ],
        fn: function() {
          var getFactorialOf = function(number){

          };

          return getFactorialOf(10)
        }
      },
      {
        id:25,
        question:"What is the first term in the Fibonacci sequence to contain 1000 digits?",
        fn: function() {
          var firstFibNumWithThisManyDigits = function(digits) {
            var fibnums = [1,2]; //console.log();

            while ( (fibnums[fibnums.length-1]+'').length < digits ) {
              var len = fibnums.length;
              fibnums.push(fibnums[len-1] + fibnums[len-2]);
            }
            console.log(fibnums[fibnums.length-1]);
            // return fibnums[fibnums.length-1];
          }
          return firstFibNumWithThisManyDigits(10);
        }
      }

    ] // end questions
};






