module Add.Types exposing (..)

type alias Model =
    { fromCurrency : String
    , fromAmount : String
    , toCurrency : String
    , toAmount : String
    , submitting : Bool
    , currencies : List String
    }

type Msg
    = SetFromCurrency String
    | SetFromAmount String
    | SetToCurrency String
    | SetToAmount String
    | Submit
    | SubmitSuccess
    | SubmitFailure
    | SetCurrencies (List String)
