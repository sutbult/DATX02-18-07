module Error.State exposing (init, update, subscriptions)

import Error.Types exposing (..)

init : (Model, Cmd Msg)
init = (
    { message = ""
    , title = ""
    }, Cmd.none)

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        Display title message ->
            ({ model | title = title, message = message }, Cmd.none)

        Dismiss ->
            ({ model | title = "", message = "" }, Cmd.none)

subscriptions : Model -> Sub Msg
subscriptions _ = Sub.none
