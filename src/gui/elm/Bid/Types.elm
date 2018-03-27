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

        "Bitcoin cash" ->
            (8, "satoshi")

        "Ethereum" ->
            (18, "wei")

        _ ->
            (0, String.toLower currency)


amountString : Value -> String
amountString account =
    let
        (basePow, _) = baseUnit account.currency
        amount = account.amount
        base = padZeroes False 1 <| String.dropRight basePow amount
        dec = removeInitialZeroes <| String.right basePow amount
        separator =
            if String.isEmpty dec then
                ""
            else
                "."
    in
        base ++ separator ++ dec


padZeroes : Bool -> Int -> String -> String
padZeroes limit n str =
    if limit then
        String.left n <| padZeroes False n str
    else
        str ++ String.repeat (n - String.length str) "0"


-- TODO: Implementera med reguljära uttryck istället
-- Se också Add.Types
removeInitialZeroes : String -> String
removeInitialZeroes str =
    if String.endsWith "0" str then
        removeInitialZeroes (String.dropRight 1 str)
    else
        str
