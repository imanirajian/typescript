namespace AddressBookChallenge.Models;

public class UkAddress : UkAddressBody
{
    public UkAddress()
    {
        
    }
    
    public UkAddress(Guid addressId, UkAddressBody body)
    {
        Addressee = body.Addressee;
        Street1 = body.Street1;
        Street2 = body.Street2;
        Town = body.Town;
        County = body.County;
        Postcode = body.Postcode;
        AddressId = addressId;
    }
    
    public Guid AddressId { get; set; }
}