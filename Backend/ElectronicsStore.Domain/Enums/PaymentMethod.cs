namespace ElectronicsStore.Domain.Enums;

public enum PaymentMethod
{
    Cash,
    Card,
    Deferred
}

public enum MovementType
{
    Purchase,
    Sale,
    ReturnSale,
    ReturnPurchase,
    Adjust
}
