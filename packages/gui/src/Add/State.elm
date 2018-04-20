module Add.State exposing (init, update, subscriptions)

import Add.Types exposing (..)
import Maybe exposing (..)
import Error.State

import Add.Rest exposing
    ( addBid
    , getCurrencies
    )


init : (Model, Cmd Msg)
init =
    let
        (errorModel, errorCmd) = Error.State.init
    in
        (   { fromCurrency = ""
            , fromAmount = ""
            , toCurrency = ""
            , toAmount = ""
            , submitting = False
            , currencies = []
            , error = errorModel
            }
        , Cmd.batch
            [ getCurrencies
            , Cmd.map ToError errorCmd
            ]
        )


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
                case getBid model of
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

        SubmitFailure error ->
            update (ToError error) {model | submitting = False}

        SetCurrencies currencies ->
            ({model
                | currencies = currencies
                , fromCurrency = firstOption currencies
                , toCurrency = secondOption currencies
            }, Cmd.none)

        ToError subMsg ->
            let
                (subModel, subCmd) = Error.State.update subMsg model.error
            in
                ({model | error = subModel}, Cmd.map ToError subCmd)


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
