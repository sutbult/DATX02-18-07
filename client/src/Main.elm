module Main exposing (main)

import Html

import Types
import State
import View

main : Program Never Types.Model Types.Msg
main =
    Html.program
        { init = State.init
        , update = State.update
        , subscriptions = State.subscriptions
        , view = View.root
        }
