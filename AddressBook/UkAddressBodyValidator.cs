using AddressBookChallenge.Models;
using FluentValidation;

namespace AddressBookChallenge;

public class UkAddressBodyValidator : AbstractValidator<UkAddressBody>
{
    public UkAddressBodyValidator()
    {
        RuleFor(x => x.Addressee).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Street1).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Street2).MaximumLength(50);
        RuleFor(x => x.Town).NotEmpty().MaximumLength(50);
        RuleFor(x => x.County).MaximumLength(50);
        RuleFor(x => x.Postcode).NotEmpty().Length(5, 8);
    }
}