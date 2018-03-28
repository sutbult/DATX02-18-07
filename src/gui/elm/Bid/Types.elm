<<<<<<< HEAD
module Bid.Types exposing (..)
=======
module Bid.Types exposing
    ( Status(..)
    , Value
    , Bid
    , AmountStatus(..)
    , createBid
    , baseUnit
    , amountStatus
    , amountString
    )

import Regex exposing (..)
import Maybe exposing (..)
>>>>>>> 8a3f0819346211f5e901d1ad5dee6bc3ee6951ae

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


type AmountStatus
    = None
    | Error
    | Success String String


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
<<<<<<< HEAD
=======


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


amountStatus : Bool -> String -> String -> AmountStatus
amountStatus withFormatting currency amount =
    if String.isEmpty amount then
        None
    else if String.isEmpty currency then
        Error
    else
        case amountRegexMatch amount of
            Just (base, dec) ->
                let
                    (padding, unit) = baseUnit currency
                    amountValue =
                        removeInitialZeroes <| String.concat
                            [ padZeroes False 1 <| base
                            , padZeroes True padding <| dec
                            ]
                    formattedValue =
                        if withFormatting then
                            formatNumber amountValue
                        else
                            amountValue
                in
                    Success formattedValue unit
            Nothing ->
                Error


amountString : Value -> String
amountString account =
    let
        (basePow, _) = baseUnit account.currency
        amount = account.amount
        base =
            formatNumber
            <| padZeroes False 1
            <| String.dropRight basePow amount
        dec =
            removeLastZeroes
            <| String.right basePow amount
        separator =
            if String.isEmpty dec then
                ""
            else
                "."
    in
        base ++ separator ++ dec


amountRegex : Regex
amountRegex = regex "^(\\d*)(?:\\.(\\d*)){0,1}$"


formatNumber : String -> String
formatNumber str =
    let
        steps = 3
        fst = String.dropRight steps str
        snd = String.right steps str
    in
        if String.isEmpty fst then
            snd
        else
            formatNumber fst ++ "'" ++ snd


zeroRegex : Regex
zeroRegex = regex "^0*$"


amountRegexMatch : String -> Maybe (String, String)
amountRegexMatch amount =
    if contains amountRegex amount then
        case find All amountRegex amount of
            res::[] ->
                case res.submatches of
                    mbase::mdec::[] ->
                        let
                            base = withDefault "" mbase
                            dec = withDefault "" mdec
                        in
                            if not <| contains zeroRegex (base ++ dec) then
                                Just (base, dec)
                            else
                                Nothing
                    _ ->
                        Nothing
            _ ->
                Nothing
    else
        Nothing


-- TODO: Implementera med reguljära uttryck istället
removeInitialZeroes : String -> String
removeInitialZeroes str =
    if String.startsWith "0" str then
        removeInitialZeroes (String.dropLeft 1 str)
    else
        str


padZeroes : Bool -> Int -> String -> String
padZeroes limit n str =
    if limit then
        String.left n <| padZeroes False n str
    else
        str ++ String.repeat (n - String.length str) "0"


-- TODO: Implementera med reguljära uttryck istället
removeLastZeroes : String -> String
removeLastZeroes str =
    if String.endsWith "0" str then
        removeLastZeroes (String.dropRight 1 str)
    else
        str
>>>>>>> 8a3f0819346211f5e901d1ad5dee6bc3ee6951ae
