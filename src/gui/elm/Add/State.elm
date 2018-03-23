module Add.State exposing (init, update, subscriptions)

import Add.Types exposing (..)
import Maybe exposing (..)
import Bid.Types exposing
    ( Bid
    , Value
    )
import Add.Rest exposing
    ( addBid
    , getCurrencies
    )


init : (Model, Cmd Msg)
init =
    (   { fromCurrency = ""
        , fromAmount = ""
        , toCurrency = ""
        , toAmount = ""
        , submitting = False
        , currencies = []
        }
    , getCurrencies)


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        SetFromCurrency value ->
            ({model | fromCurrency = value}, Cmd.none)

        SetFromAmount value ->
            ({model | fromAmount = value}, Cmd.none)

        SetToCurrency value ->
            ({model | toCurrency = value}, Cmd.none)

        SetToAmount value ->
            ({model | toAmount = value}, Cmd.none)

        Submit ->
            if not model.submitting then
                -- TODO: Skriv ut fel tydligt vad som är fel
                case Debug.log "Bid" <| getBid model of
                    Just bid ->
                        ({model | submitting = True}, addBid bid)

                    Nothing ->
                        (model, Cmd.none)
            else
                (model, Cmd.none)

        SubmitSuccess ->
            ({ model
                | fromCurrency = ""
                , fromAmount = ""
                , toCurrency = ""
                , toAmount = ""
                , submitting = False
            }, Cmd.none)

        SubmitFailure ->
            (model, Cmd.none)

        SetCurrencies currencies ->
            ({model | currencies = currencies}, Cmd.none)


getBid : Model -> Maybe Bid
getBid model =
    case String.toFloat model.fromAmount of
        Ok fromAmount ->
            case String.toFloat model.toAmount of
                Ok toAmount ->
                    Just <| Bid "0" Bid.Types.Active
                        (Value model.fromCurrency fromAmount)
                        (Value model.toCurrency toAmount)
                Err _ ->
                    Nothing
        Err _ ->
            Nothing


subscriptions : Model -> Sub Msg
subscriptions _ = Sub.none
