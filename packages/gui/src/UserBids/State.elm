module UserBids.State exposing (..)

import UserBids.Types exposing (..)
import UserBids.Rest exposing (getUserBids)
import Error.State
import Ports


init : (Model, Cmd Msg)
init =
    let
        (errorModel, errorCmd) = Error.State.init
    in
        (   { bids = []
            , error = errorModel
            }
        , Cmd.batch
            [ getUserBids
            , Cmd.map ToError errorCmd
            ]
        )


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        Noop ->
            (model, Cmd.none)

        SetBids bids ->
            ({model | bids = bids}, Cmd.none)

        ToError subMsg ->
            let
                (subModel, subCmd) = Error.State.update subMsg model.error
            in
                ({model | error = subModel}, Cmd.map ToError subCmd)

        UpdateBids ->
            (model, getUserBids)


subscriptions : Model -> Sub Msg
subscriptions _ =
    Ports.updateBids <| (\_ -> UpdateBids)
