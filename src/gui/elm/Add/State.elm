module Add.State exposing (init, update, subscriptions)

import Add.Types exposing (..)

init : (Model, Cmd Msg)
init =
    (   { fromCurrency = ""
        , fromAmount = ""
        , toCurrency = ""
        , toAmount = ""
        }
    , Cmd.none)

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

subscriptions : Model -> Sub Msg
subscriptions _ = Sub.none
