module State exposing (init, update, subscriptions)

import Types exposing
    ( Model
    , Msg
    )

init : (Model, Cmd Msg)
init = (
    { foo = 3
    }
    , Cmd.none
    )

update : Msg -> Model -> (Model, Cmd Msg)
update _ m = (m, Cmd.none)

subscriptions : Model -> Sub Msg
subscriptions _ = Sub.none
