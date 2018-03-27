module Add.State exposing (init, update, subscriptions)

import Add.Types exposing (..)
import Maybe exposing (..)

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
                -- Gör #36 först
                case Debug.log "Bid" <| getBid model of
                    Just bid ->
                        ({model | submitting = True}, addBid bid)

                    Nothing ->
                        (model, Cmd.none)
            else
                (model, Cmd.none)

        SubmitSuccess ->
            ({ model
                | fromAmount = ""
                , toAmount = ""
                , submitting = False
            }, Cmd.none)

        SubmitFailure ->
            (model, Cmd.none)

        SetCurrencies currencies ->
            ({model
                | currencies = currencies
                , fromCurrency = firstOption currencies
                , toCurrency = secondOption currencies
            }, Cmd.none)


firstOption : List String -> String
firstOption currencies =
    case currencies of
        [] ->
            ""

        (currency::_) ->
            currency


secondOption : List String -> String
secondOption currencies =
    case currencies of
        (_::currency::_) ->
            currency

        _ ->
            firstOption currencies


subscriptions : Model -> Sub Msg
subscriptions _ = Sub.none
