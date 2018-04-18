module Bid.Types exposing
    ( Status(..)
    , Value
    , Bid
    , AmountStatus(..)
    , createBid
    , currencyMeta
    , currencyName
    , amountStatus
    , amountString
    , statusChanged
    )

import Regex exposing (..)
import Maybe exposing (..)

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


type alias CurrencyMeta =
    { name : String
    , offset : Int
    , unit : String
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


currencyMeta : String -> CurrencyMeta
currencyMeta currency =
    case currency of
        "BTC" ->
            { name = "Bitcoin"
            , offset = 8
            , unit = "satoshi"
            }

        "BCH" ->
            { name = "Bitcoin Cash"
            , offset = 8
            , unit = "satoshi"
            }

        "ETH" ->
            { name = "Ethereum"
            , offset = 18
            , unit = "wei"
            }

        "ETC" ->
            { name = "Ethereum Classic"
            , offset = 18
            , unit = "wei"
            }

        _ ->
            { name = String.toUpper currency
            , offset = 0
            , unit = String.toUpper currency
            }


currencyName : String -> String
currencyName = .name << currencyMeta


amountStatus : Bool -> String -> String -> AmountStatus
amountStatus withFormatting currency amount =
    if String.isEmpty amount then
        None
    else if String.isEmpty currency then
        Error
    else
        case amountRegexMatch <| removeApostrophes amount of
            Just (base, dec) ->
                let
                    meta = currencyMeta currency
                    amountValue =
                        removeInitialZeroes <| String.concat
                            [ padZeroes False 1 <| base
                            , padZeroes True meta.offset <| dec
                            ]
                    formattedValue =
                        if withFormatting then
                            formatNumber amountValue
                        else
                            amountValue
                in
                    Success formattedValue meta.unit
            Nothing ->
                Error


removeApostrophes : String -> String
removeApostrophes =
    replace All (regex "'") (\_ -> "")


amountString : Value -> String
amountString account =
    let
        offset = .offset <| currencyMeta account.currency
        amount = account.amount
        base =
            formatNumber
            <| padZeroes False 1
            <| String.dropRight offset amount
        dec =
            removeLastZeroes
            <| padZeroesLeft offset
            <| String.right offset amount
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


padZeroesLeft : Int -> String -> String
padZeroesLeft n str =
    String.repeat (n - String.length str) "0" ++ str


-- TODO: Implementera med reguljära uttryck istället
removeLastZeroes : String -> String
removeLastZeroes str =
    if String.endsWith "0" str then
        removeLastZeroes (String.dropRight 1 str)
    else
        str


-- Status changed

statusChanged : List Bid -> List Bid -> List Bid
statusChanged new old =
    []
