module Breadcrumb.State exposing
    ( init
    , update
    , subscriptions
    )

import Breadcrumb.Types exposing (..)

init : Model
init = {}

update : Msg -> Model -> (Model, Cmd Msg)
update = never

subscriptions : Model -> Sub Msg
subscriptions _ = Sub.none
