module Browse.Accept.State exposing
    ( init
    , update
    , subscriptions
    )

import Task

import Browse.Accept.Types exposing (..)
import Browse.Accept.Rest exposing (acceptBid)
import Ports

init : (Model, Cmd Msg)
init =
    (   { modal = Nothing
        , processing = False
        , sseID = -1
        }
    , Cmd.none
    )


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        -- Modal
        DisplayModal bid ->
            ({model | modal = Just bid}, Cmd.none)

        CancelModal ->
            ({model | modal = Nothing}, Cmd.none)

        -- Accept bid
        AcceptBid bid ->
            if model.sseID >= 0 then
                ({model | processing = True}, acceptBid bid model.sseID)
            else
                (model, Cmd.none)

        EndProcessingBid ->
            ({model
                | processing = False
                , modal = Nothing
            }, Cmd.none)

        AcceptFailure error ->
            let
                (newModel, newCmd) = update EndProcessingBid model
            in
                ( newModel
                , Cmd.batch
                    [ newCmd
                    , Task.perform ToError (Task.succeed error)
                    ]
                )

        -- Misc
        GetSSEId id ->
            ({model | sseID = id}, Cmd.none)

        Noop ->
            (model, Cmd.none)

        ToError _ ->
            (model, Cmd.none)


subscriptions : Model -> Sub Msg
subscriptions model =
    if model.sseID < 0 then
        Ports.getSSEId GetSSEId

    else if model.processing then
        Ports.acceptBidResponse <| (\_ -> EndProcessingBid)

    else
        Sub.none
