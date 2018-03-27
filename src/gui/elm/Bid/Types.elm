module Bid.Types exposing (..)

type Status
    = Active
    | Pending
    | Finished

type alias Value =
    { currency : String
    , amount : String
    }

type alias Bid =
    { id : String
    , status : Status
    , from : Value
    , to : Value
    }


-- Easy constructor for Bid
createBid
    :  String
    -> Status
    -> String
    -> String
    -> String
    -> String
    -> Bid
createBid id status fromCurrency fromAmount toCurrency toAmount =
    Bid id status
        (Value fromCurrency fromAmount)
        (Value toCurrency toAmount)


baseUnit : String -> (Int, String)
baseUnit currency =
    case currency of
        "Bitcoin" ->
            (8, "satoshi")

        "Ethereum" ->
            (18, "wei")

        _ ->
            (0, String.toLower currency)
