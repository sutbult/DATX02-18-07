module Password.State exposing
    ( init
    , update
    , subscriptions
    )

import Dict

import Password.Types exposing (..)


init : (Model, Cmd Msg)
init =
    let
        model =
            { passwords = Dict.empty
            , instance = Nothing
            }
    in
        (model , Cmd.none)

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    (model, Cmd.none)

subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none
