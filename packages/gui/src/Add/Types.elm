module Add.Types exposing (..)

import Maybe exposing (..)
import Error.Types


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
    , error : Error.Types.Model
    }


type Msg
    = SetFromCurrency String
    | SetFromAmount String
    | SetToCurrency String
    | SetToAmount String
    | SubmitContinue
    | SubmitSuccess
    | SubmitFailure Error.Types.Msg
    | SetCurrencies (List String)
    | ToError Error.Types.Msg
    | TriggerPassword
        (List String)
        (Maybe Msg)
        Msg
    | Noop


submit : String -> String -> Msg
submit from to = TriggerPassword
    [from, to]
    (Just Noop)
    SubmitContinue


getBid : Model -> Maybe Bid
getBid model =
    case
        ( amountStatus False model.fromCurrency model.fromAmount
        , amountStatus False model.toCurrency model.toAmount
        ) of
            (Success fromAmount _, Success toAmount _) ->
                Just
                    <| createBid "0" Bid.Types.Active
                        model.fromCurrency
                        fromAmount
                        model.toCurrency
                        toAmount
            _ ->
                Nothing
