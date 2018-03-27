module Add.Types exposing (..)

import Maybe exposing (..)


import Bid.Types exposing
    ( Bid
    , Value
    , createBid
    , amountStatus
    , AmountStatus(Success)
    )


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


getBid : Model -> Maybe Bid
getBid model =
    case
        ( amountStatus model.fromCurrency model.fromAmount
        , amountStatus model.toCurrency model.toAmount
        ) of
            (Success fromAmount _, Success toAmount _) ->
                Maybe.map4 (createBid "0" Bid.Types.Active)
                    (Just model.fromCurrency)
                    (Just fromAmount)
                    (Just model.toCurrency)
                    (Just toAmount)
            _ ->
                Nothing
