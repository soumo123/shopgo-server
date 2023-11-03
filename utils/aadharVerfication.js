
 const validateAadhar = async(aadharNumber)=> {
        const aadharRegex = /^\d{12}$/;
        if (!aadharRegex.test(aadharNumber)) {
          return false;
        }
        // Validate using the Luhn algorithm
        const digits = aadharNumber.split('').map(Number);
        const checksum = digits.reduce((sum, digit, index) => {
          const multiplier = (index % 2 === 0) ? 1 : 2;
          const product = digit * multiplier;
          return sum + (product > 9 ? product - 9 : product);
        }, 0);
      
        return checksum % 10 === 0;
      
    }
  

module.exports = validateAadhar