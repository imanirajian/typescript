using System.ComponentModel.DataAnnotations;

namespace AddressBookChallenge.Models;

public class UkAddressBody
{
    // Required, minimum length 1, maximum length 50 characters
    // Example: Mrs. Elizabeth White
    //[Required]
    //[StringLength(maximumLength:50, MinimumLength = 1)]
    public string Addressee { get; set; }
    
    // Required, not empty, maximum length 50 characters
    // Example: Hathaway Cottage
    //[Required]
    //[StringLength(maximumLength:50, MinimumLength = 1)]
    public string Street1 { get; set; }
    
    // Optional, not empty, maximum length 50 characters
    // Example: 1 Main Street
    //[StringLength(maximumLength:50, MinimumLength = 1)]
    public string? Street2 { get; set; }
    
    // Required, not empty, maximum length 50 characters
    //[Required]
    //[StringLength(maximumLength:50, MinimumLength = 1)]
    public string Town { get; set; }
    
    // Optional, not empty, maximum length 50 characters
    //[StringLength(maximumLength:50, MinimumLength = 1)]
    public string? County { get; set; }
    
    // Required, minimum length 5, maximum length 8 characters, only letters and numbers are allowed
    //[Required]
    //[StringLength(maximumLength:8, MinimumLength = 5)]
    public string Postcode { get; set; }
}