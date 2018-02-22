module View exposing (root)

import Html exposing (..)

import Types exposing (..)
import Browse.View

root : Model -> Html Msg
root model = map Browse (Browse.View.root (.browse model))
